var net = require("net");
const { build_buffer, memchr } = require("./protocol");
const { CRC16 } = require("./crc16");

class SSDBClient {
  constructor(ssdb_hosts, options) {
    options = options || {};

    let opts = { ...options };
    opts.reconnect_max_interval_sec =
      parseInt(options.reconnect_max_interval_sec) || 60;

    opts.log_error_fn = options.log_error_fn || console.log;

    this.options = opts;

    this.logerror = opts.log_error_fn;
    this._socks = [];
    this._callbacks = [];
    this._reconnect_retries = 0;
    this._reconnecting = ssdb_hosts.map((e) => false);

    this.ssdb_hosts = ssdb_hosts.map((e) => {
      const s = e.split(":");
      if (!s || s.length != 2) {
        throw Error(`bad host list format: ${e}`);
      }
      return {
        host: s[0],
        port: parseInt(s[1]),
      };
    });
  }

  connect = async () => {
    this._socks = [];
    this._callbacks = [];
    let socks = await Promise.allSettled(
      this.ssdb_hosts.map((node) => this._connect(node.host, node.port))
    );

    const allGood = socks.reduce(
      (acc, cur) => acc && cur.status == "fulfilled",
      true
    );

    if (!allGood) {
      // if one ore more connection failed
      // close the open sockets
      let errors = [];
      socks.forEach((v, i) => {
        if (v.status == "rejected") {
          errors.push(
            `${JSON.stringify(this.ssdb_hosts[i])} connection failed: ${v.reason
            }`
          );
        } else {
          const [s, _] = v.value;
          s.end();
        }
      });
      throw new Error(errors.join(";"));
    } else {
      socks = socks.map((e) => e.value);
    }

    for (const [idx, [sock, callabacks]] of socks.entries()) {
      this._socks[idx] = sock;
      this._callbacks[idx] = callabacks;
    }
  };

  close = () => {
    this._socks.forEach((s) => {
      s.destroy();
    });
  };

  is_clustered = () => {
    return this.ssdb_hosts.length > 1;
  };

  _connect = async (host, port) => {
    let sock = new net.Socket();
    let recv_buf = Buffer.alloc(0);
    let callbacks = [];
    let self = this;

    let sockopt = {
      host,
      port,
    };
    function _parse() {
      var ret = [];
      var spos = 0;
      var pos;
      while (true) {
        //pos = recv_buf.indexOf('\n', spos);
        pos = memchr(recv_buf, "\n", spos);
        if (pos == -1) {
          // not finished
          return null;
        }
        var line = recv_buf.subarray(spos, pos).toString();
        spos = pos + 1;
        line = line.replace(/^\s+(.*)\s+$/, "$&");
        if (line.length == 0) {
          // parse end
          //recv_buf = recv_buf.substr(spos);
          recv_buf = recv_buf.subarray(spos);
          break;
        }
        var len = parseInt(line);
        if (isNaN(len)) {
          // error
          self.logerror("error 1");
          return null;
        }
        if (spos + len > recv_buf.length) {
          // not finished
          return null;
        }
        //var data = recv_buf.substr(spos, len);
        var data = recv_buf.subarray(spos, spos + len);
        spos += len;
        ret.push(data);

        //pos = recv_buf.indexOf('\n', spos);
        pos = memchr(recv_buf, "\n", spos);
        if (pos == -1) {
          // not finished
          return null;
        }
        // '\n', or '\r\n'
        //if(recv_buf.charAt(spos) != '\n' && recv_buf.charAt(spos) != '\r' && recv_buf.charAt(spos+1) != '\n'){
        var cr = "\r".charCodeAt(0);
        var lf = "\n".charCodeAt(0);
        if (
          recv_buf[spos] != lf &&
          recv_buf[spos] != cr &&
          recv_buf[spos + 1] != lf
        ) {
          // error
          self.logerror("error 4 " + recv_buf[spos]);
          return null;
        }
        spos = pos + 1;
      }

      return ret;
    }
    // Connect timeout = 5
    sock.setTimeout(5000);
    // Wait for connection
    await new Promise((resolve, reject) => {
      let timeout = () => reject("socket_timeout");
      let sockerr = (e) => reject(e);
      sock.on("error", sockerr);
      sock.on("timeout", timeout);
      sock.connect(sockopt, function () {
        sock.setNoDelay(true);
        sock.setKeepAlive(true);
        sock.setTimeout(0);
        sock.removeListener("error", sockerr);
        sock.removeListener("timeout", timeout);
        //sock.removeAllListeners();
        resolve();
      });
    });

    sock.on("data", function (data) {
      recv_buf = build_buffer([recv_buf, data]);
      while (recv_buf.length > 0) {
        let resp = _parse();
        if (!resp) {
          break;
        }
        resp[0] = resp[0].toString();
        let callback = callbacks.shift();
        callback(resp);
      }
    });

    sock.on("error", function (err) {
      self.logerror("socket error:", err);
      while (callbacks.length > 0) {
        let cb = callbacks.shift();
        cb(["socket_error"]);
      }
      sock.destroy();
    });

    sock.on("close", () => {
      while (callbacks.length > 0) {
        let cb = callbacks.shift();
        cb(["socket_closed"]);
      }
    });

    sock.on("timeout", function () {
      sock.destroy();
      while (callbacks.length > 0) {
        let cb = callbacks.shift();
        cb(["socket_timeout"]);
      }
    });

    return [sock, callbacks];
  };

  raw_request = (arg_list) => {
    const cmd = arg_list.shift();
    let self = this;
    return new Promise((resolve, reject) => {
      self._request(cmd, [...arg_list], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp.map((e) => e.toString()));
        } else {
          err = {
            code: err,
            message: resp.map((e) => e.toString()).join(","),
          };
          reject(err);
        }
      });
    });
  };

  _request = (cmd, params, callback) => {
    let idx = 0;

    if (
      ![
        // TODO andoli: add mandatory idx arg for these:
        "multi_get",
        "multi_set",
        //
        "hlist",
        "keys",
        "rkeys",
        "scan",
        "rscan",
        //
        "info",
        "flushdb",
        "dbsize",
        "compact",
      ].includes(cmd)
    ) {
      if (params.length < 1)
        throw new Error(`Missing argument for command ${cmd}`);
      let key = params[0];
      if (key) {
        idx = this.partition4key(key);
        //console.log(`${cmd} key=${key} NODE[${idx}]`);
      }
    } else {
      if (this.is_clustered())
        throw new Error(`Command ${cmd} cannot be executed in clustered mode`);
    }

    let arr = [cmd].concat(params);
    this.send_request_to_node(idx, arr, callback);
  };

  partition4key = (key) => {
    return SSDBClient.part4key(key, this.ssdb_hosts.length);
  };

  static part4key(key, partition_count) {
    let partition = CRC16(key) % partition_count
    return partition;
  }

  partition4cmd = (cmd) => {
    if (!Array.isArray(cmd) || cmd.length < 2) return -1;
    let partition = CRC16(cmd[1]) % this.ssdb_hosts.length;
    return partition;
  };

  send_request_to_node = (idx, params, callback) => {
    if (this._socks.length == 0 || this._callbacks.length == 0)
      throw new Error("not connected");
    var bs = [];
    for (var i = 0; i < params.length; i++) {
      var p = params[i];
      if (!(p instanceof Buffer)) {
        p = p.toString();
        bs.push(Buffer.byteLength(p));
      } else {
        bs.push(p.length);
      }
      bs.push("\n");
      bs.push(p);
      bs.push("\n");
    }
    bs.push("\n");

    const sock = this._socks[idx];
    this._callbacks[idx].push(callback);
    if (!sock.writable) {
      if (!this._reconnecting[idx]) {
        const sleepMsec = Math.min(
          ++this._reconnect_retries * 1000,
          this.options.reconnect_max_interval_sec * 1000
        );
        this.logerror(`Socket ${idx} reconnect in ${sleepMsec} msec...`);
        let x = this.ssdb_hosts[idx];
        this._reconnecting[idx] = true;
        let self = this;
        setTimeout(() => {
          self
            ._connect(x.host, x.port)
            .then((res) => {
              const [sock, callbacks] = res;
              self._socks[idx] = sock;
              self._callbacks[idx] = callbacks;
              self.logerror(`Socket ${idx} reconnected`);
              self._reconnect_retries = 0;
            })
            .catch((err) => {
              self.logerror(`Socket ${idx} reconnect failed`, err);
            })
            .finally(() => {
              self._reconnecting[idx] = false;
            });
        }, sleepMsec);
      }

      for (let cb; (cb = this._callbacks[idx].pop());) {
        cb(["socket_write_err"]);
      }
      return;
    }
    sock.write(build_buffer(bs));
  };

  ////////////////////////////////////////
  //////////////// SERVER ////////////////
  ////////////////////////////////////////

  a_compact = async function () {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("compact", [], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_dbsize = async function () {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("dbsize", [], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_flushdb = async function (type) {
    let self = this;
    return new Promise((resolve, reject) => {
      if (!type) type = "";
      if (["", "kv", "hash", "zset", "list"].indexOf(type) == -1) type = "";

      self._request("flushdb", [type], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };


  _all_command = async function (cmd, ...args) {
    // executes a command on all nodes; returns vector of results
    let self = this;
    let promises = [];
  
    for(let i=0; i< this.ssdb_hosts.length; i++)
    {
      promises.push(
        new Promise((resolve, reject) => {
          let arr = [cmd].concat(args);
          self.send_request_to_node(i , arr, function (resp) {
            let err = resp[0] == "ok" ? 0 : resp[0];
            if (err == 0) {
              resolve(resp.slice(1).map(e => e.toString()));
            } else {
              reject(err);
            }
          });
        })
      );
    }
    const results = await Promise.allSettled(promises);
    console.log(results);
    for(const r of results)
    {
      if(r.status != 'fulfilled'){
        
      }
    }
    return results;
    
  }

  a_info = async function (opt) {
    let self = this;
    let opts = opt ? [opt] : [];
    return new Promise((resolve, reject) => {
      self._request("info", opts, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = {};
          for (var i = 2; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };


  all_flushdb = async function name(type) {
    type = type || "";
    return await this._all_command("flushdb", type);
  }

  all_compact = async function name() {
    return await this._all_command("compact");
  }

  all_info = async function name(...args) {
    return await this._all_command("info", ...args);
  }


  a_info_cluster = async function (idx, opt) {
    let self = this;
    let opts = opt ? [opt] : [];
    return new Promise((resolve, reject) => {
      self.send_request_to_node(idx, ["info"].concat(opts), function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = {};
          for (var i = 2; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  ////////////////////////////////////////
  //////////////// KEY-VALUE /////////////
  ////////////////////////////////////////

  a_get = async (key) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("get", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_set = async (key, val) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("set", [key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_setx = async (key, val, ttl) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("setx", [key, val, ttl], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_setnx = async (key, val) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("setnx", [key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          // 1: value is set, 0: key already exists.
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_expire = async (key, ttl) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("expire", [key, ttl], function (resp) {
        // If the key exists and ttl is set, return 1, otherwise return 0.
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_ttl = async (key) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("ttl", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_getset = async (key, val) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("getset", [key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_del = async (key) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("del", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_incr = async (key, num) => {
    let self = this;
    if (!num) num = 1;
    num = parseInt(num);

    return new Promise((resolve, reject) => {
      self._request("incr", [key, num], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_exists = async (key) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("exists", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_substr = async (key, start, size) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("substr", [key, start, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_strlen = async (key) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("strlen", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_rkeys = async (key_start, key_end, limit) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("rkeys", [key_start, key_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_rscan = async (key_start, key_end, limit) => {
    let self = this;
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("rscan", [key_start, key_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length % 2 != 1) {
          reject("error");
          return;
        }
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_set = async (kv) => {
    let self = this;
    return new Promise((resolve, reject) => {
      let nkv = [];
      if (kv) {
        Object.keys(kv).forEach(function (k) {
          if (kv[k]) {
            nkv.push(k);
            nkv.push(kv[k]);
          }
        });
      }
      self._request("multi_set", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_get = async (keyz) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("multi_get", keyz, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_del = async (keyz) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("multi_del", keyz, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_scan = async (key_start, key_end, limit) => {
    let self = this;
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("scan", [key_start, key_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length % 2 != 1) {
          reject("error");
          return;
        }
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_keys = async (key_start, key_end, limit) => {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("keys", [key_start, key_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  ////////////////////////////////////////
  //////////////// HASHMAP ///////////////
  ////////////////////////////////////////

  a_hget = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hget", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_hset = async function (name, key, val) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hset", [name, key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hdel = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hdel", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hscan = async function (name, key_start, key_end, limit) {
    let self = this;
    key_start = key_start || "";
    key_end = key_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request(
        "hscan",
        [name, key_start, key_end, limit],
        function (resp) {
          let err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = {};
            for (var i = 1; i < resp.length; i += 2) {
              data[resp[i].toString()] = resp[i + 1].toString();
            }
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_hlist = async function (name_start, name_end, limit) {
    let self = this;
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("hlist", [name_start, name_end, limit], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_hsize = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hsize", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hclear = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hclear", [name], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hgetall = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hgetall", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_hexists = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("hexists", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hincr = async function (name, key, num) {
    let self = this;
    num = parseInt(num) || 1;

    return new Promise((resolve, reject) => {
      self._request("hincr", [name, key, num], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_hrlist = async function (name_start, name_end, limit) {
    let self = this;
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("hrlist", [name_start, name_end, limit], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_hkeys = async function (name, name_start, name_end, limit) {
    let self = this;
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request(
        "hkeys",
        [name, name_start, name_end, limit],
        function (resp) {
          let err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = [];
            for (var i = 1; i < resp.length; i++) {
              data.push(resp[i].toString());
            }
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_hrscan = async function (name, key_start, key_end, limit) {
    let self = this;
    key_start = key_start || "";
    key_end = key_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request(
        "hrscan",
        [name, key_start, key_end, limit],
        function (resp) {
          let err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = {};
            for (var i = 1; i < resp.length; i += 2) {
              data[resp[i].toString()] = resp[i + 1].toString();
            }
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_multi_hget = async function (name, keyz) {
    let self = this;
    return new Promise((resolve, reject) => {
      let nkv = [];
      if (name && keyz.length > 0) {
        nkv.push(name);
        keyz.forEach(function (k) {
          nkv.push(k);
        });
      } else {
        resolve({});
      }
      self._request("multi_hget", nkv, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_hdel = async function (name, keyz) {
    let self = this;
    return new Promise((resolve, reject) => {
      let nkv = [];
      if (name && keyz.length > 0) {
        nkv.push(name);
        keyz.forEach(function (k) {
          nkv.push(k);
        });
      }
      self._request("multi_hdel", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_hset = async function (name, kv) {
    let self = this;
    return new Promise((resolve, reject) => {
      let nkv = [];
      if (name && kv) {
        nkv.push(name);

        Object.keys(kv).forEach(function (k) {
          if (kv[k]) {
            nkv.push(k);
            nkv.push(kv[k]);
          }
        });
      }
      self._request("multi_hset", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  ////////////////////////////////////////
  ////////////////   LIST  ///////////////
  ////////////////////////////////////////

  a_qpush_front = async function (name, ...elems) {
    let self = this;
    return new Promise((resolve, reject) => {
      elems.unshift(name);
      self._request("qpush_front", elems, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_qpush = async function (name, ...elems) {
    return this.a_qpush_back(name, ...elems);
  };

  a_qpush_back = async function (name, ...elems) {
    let self = this;
    return new Promise((resolve, reject) => {
      elems.unshift(name);
      self._request("qpush_back", elems, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_qpop_front = async function (name, size) {
    let self = this;
    size = size || 1;
    return new Promise((resolve, reject) => {
      self._request("qpop_front", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          let data;
          if (resp.length > 2) {
            data = [];
            for (var i = 1; i < resp.length; i++) {
              data.push(resp[i].toString());
            }
          } else {
            data = resp[1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  //qpop name item1 item2 ... Alias of `qpop_front`.
  a_qpop = async function (name, ...elems) {
    return this.a_qpop_back(name, ...elems);
  };

  a_qpop_back = async function (name, size) {
    let self = this;
    size = size || 1;
    return new Promise((resolve, reject) => {
      self._request("qpop_back", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          let data;
          if (resp.length > 2) {
            data = [];
            for (var i = 1; i < resp.length; i++) {
              data.push(resp[i].toString());
            }
          } else {
            data = resp[1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_qfront = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qfront", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_qback = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qback", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_qsize = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qsize", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_qclear = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qclear", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  a_qget = async function (name, idx) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qget", [name, idx], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_qset = async function (name, idx, val) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qset", [name, idx, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[0].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  a_qrange = async function (name, offset, limit) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qrange", [name, offset, limit], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_qslice = async function (name, begin, end) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qslice", [name, begin, end], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_qtrim_front = async function (name, size) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qtrim_front", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_qtrim_back = async function (name, size) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("qtrim_back", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  a_qlist = async function (name_start, name_end, limit) {
    let self = this;
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("qlist", [name_start, name_end, limit], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_qrlist = async function (name_start, name_end, limit) {
    let self = this;
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("qrlist", [name_start, name_end, limit], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  ////////////////////////////////////////
  //////////////// Z-SET   ///////////////
  ////////////////////////////////////////

  a_zget = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zget", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zsize = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zsize", [name], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zset = async function (name, key, score) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zset", [name, key, score], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zdel = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zdel", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zscan = async function (name, key_start, score_start, score_end, limit) {
    let self = this;
    key_start = key_start || "";
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self._request(
        "zscan",
        [name, key_start, score_start, score_end, limit],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = [];
            for (var i = 1; i < resp.length; i += 2) {
              let elem = [resp[i].toString(), parseInt(resp[i + 1]) ];
              data.push(elem);
            }
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_zlist = async function (name_start, name_end, limit) {
    let self = this;
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("zlist", [name_start, name_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          let data = [];
          for (let i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  //zsum name score_start score_end Returns the sum of elements of the sorted set stored at the specified key which have scores in the range [score_start,score_end].
  a_zsum = async function (name, score_start, score_end) {
    let self = this;
    score_start = !isNaN(parseInt(score_start)) ? parseInt(score_start) : "";
    score_end = !isNaN(parseInt(score_end)) ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self._request("zsum", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zavg = async function (name, score_start, score_end) {
    let self = this;
    score_start = !isNaN(parseInt(score_start)) ? parseInt(score_start) : "";
    score_end = !isNaN(parseInt(score_end)) ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self._request("zavg", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseFloat(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zclear = async function (name) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zclear", name, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zexists = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zexists", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zincr = async function (name, key, num) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zincr", [name, key, num], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        resolve(err);
      });
    });
  };

  a_zrlist = async function (name_start, name_end, limit) {
    let self = this;
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self._request("zrlist", [name_start, name_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];

          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_zkeys = async function (name, key_start, score_start, score_end, limit) {
    let self = this;
    key_start = key_start || "";
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self._request(
        "zkeys",
        [name, key_start, score_start, score_end, limit],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = [];
            for (var i = 1; i < resp.length; i++) {
              data.push(resp[i].toString());
            }
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_zrscan = async function (name, key_start, score_start, score_end, limit) {
    let self = this;
    key_start = key_start || "";
    score_start = score_start || "";
    score_end = score_end || "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self._request(
        "zrscan",
        [name, key_start, score_start, score_end, limit],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            var data = [];
            for (var i = 1; i < resp.length; i++) {
              i % 2 == 0
                ? data.push(parseInt(resp[i]))
                : data.push(resp[i].toString());
            }
            resolve([err, data]);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_zrank = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zrank", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zrrank = async function (name, key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("zrrank", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zcount = async function (name, score_start, score_end) {
    let self = this;
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self._request("zcount", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_zpop_front = async function (name, limit) {
    let self = this;
    limit = parseInt(limit) || 1;
    return new Promise((resolve, reject) => {
      self._request("zpop_front", [name, parseInt(limit)], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i += 2) {
            let elem = {};
            elem[resp[i].toString()] = parseInt(resp[i + 1]);
            data.push(elem);
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_zpop_back = async function (name, limit) {
    let self = this;
    limit = parseInt(limit) || 1;
    return new Promise((resolve, reject) => {
      self._request("zpop_back", [name, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i += 2) {
            let elem = {};
            elem[resp[i].toString()] = parseInt(resp[i + 1]);
            data.push(elem);
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_zremrangebyrank = async function (name, start_rank, end_rank) {
    let self = this;
    start_rank = parseInt(start_rank);
    end_rank = parseInt(end_rank);
    return new Promise((resolve, reject) => {
      self._request(
        "zremrangebyrank",
        [name, start_rank, end_rank],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            resolve(parseInt(resp[1]));
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_zremrangebyscore = async function (name, start_score, end_score) {
    let self = this;
    start_score = parseInt(start_score);
    end_score = parseInt(end_score);
    return new Promise((resolve, reject) => {
      self._request(
        "zremrangebyscore",
        [name, start_score, end_score],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            resolve(parseInt(resp[1]));
          } else {
            reject(err);
          }
        }
      );
    });
  };

  a_multi_zset = async function (name, ks) {
    let self = this;
    let nks = [];
    if (name && ks) {
      nks.push(name);

      Object.keys(ks).forEach(function (k) {
        if (ks[k]) {
          nks.push(k);
          nks.push(ks[k]);
        }
      });
    }
    return new Promise((resolve, reject) => {
      self._request("multi_zset", nks, function (resp) {
        {
          let err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            resolve(parseInt(resp[1]));
          } else {
            reject(err);
          }
        }
      });
    });
  };

  /** multi_zdel expects an array as second argument */
  a_multi_zdel = async function (name, k) {
    let self = this;
    k.unshift(name);
    return new Promise((resolve, reject) => {
      self._request("multi_zdel", k, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  a_multi_zget = async function (name, k) {
    let self = this;
    return new Promise((resolve, reject) => {
      self._request("multi_zget", [name, ...k], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i += 2) {
            let elem = {};
            elem[resp[i].toString()] = parseInt(resp[i + 1]);
            data.push(elem);
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  a_zrange = async function (name, offset, limit) {
    let self = this;
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self._request("zrange", [name, offset, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i += 2) {
            let elem = {};
            elem[resp[i].toString()] = parseInt(resp[i + 1]);
            data.push(elem);
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  a_zrrange = async function (name, offset, limit) {
    let self = this;
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self._request("zrrange", [name, offset, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          var data = [];
          for (var i = 1; i < resp.length; i += 2) {
            let elem = {};
            elem[resp[i].toString()] = parseInt(resp[i + 1]);
            data.push(elem);
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  // All methods here
}

module.exports = {
  SSDBClient,
};
