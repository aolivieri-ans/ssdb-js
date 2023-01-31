exports.register = function (self) {
  // callback(val)
  self.hget = function (name, key, callback) {
    self.request("hget", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          callback(err, resp[1]);
        } else {
          callback("error");
        }
      }
    });
  };

  self.a_hget = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("hget", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  // callback(err);
  self.hset = function (name, key, val, callback) {
    self.request("hset", [name, key, val], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_hset = function (name, key, val) {
    return new Promise((resolve, reject) => {
      self.request("hset", [name, key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  // callback(err);
  self.hdel = function (name, key, callback) {
    self.request("hdel", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_hdel = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("hdel", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  // callback(err, {index:[], items:{key:score}})
  self.hscan = function (name, key_start, key_end, limit, callback) {
    self.request("hscan", [name, key_start, key_end, limit], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length % 2 != 1) {
          callback("error");
        } else {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          callback(err, data);
        }
      }
    });
  };

  // callback(err, [])
  self.hlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807; //max elements at hash
    }
    self.request("hlist", [name_start, name_end, limit], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = [];
        for (var i = 1; i < resp.length; i++) {
          data.push(resp[i].toString());
        }
        callback(err, data);
      }
    });
  };

  self.a_hlist = function (name_start, name_end, limit) {
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("hlist", [name_start, name_end, limit], function (resp) {
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

  // callback(size)
  self.hsize = function (name, callback) {
    self.request("hsize", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          var size = parseInt(resp[1]);
          callback(err, size);
        } else {
          var score = 0;
          callback("error");
        }
      }
    });
  };

  self.a_hsize = function (name) {
    return new Promise((resolve, reject) => {
      self.request("hsize", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  //hclear name Delete all keys in a hashmap.
  self.hclear = function (key, callback) {
    self.request("hclear", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  //hgetall name Returns the whole hash, as an array of strings indexed by strings.
  self.hgetall = function (key, callback) {
    self.request("hgetall", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = {};
        for (var i = 1; i < resp.length; i += 2) {
          data[resp[i].toString()] = resp[i + 1].toString();
        }
        callback(err, data);
      }
    });
  };

  self.a_hgetall = function (name) {
    return new Promise((resolve, reject) => {
      self.request("hgetall", name, function (resp) {
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

  //hexists name key Verify if the specified key exists in a hashmap.
  self.hexists = function (name, key, callback) {
    self.request("hexists", [name, key], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        let res = parseInt(resp[1].toString());

        if (res === 0) res = false;
        else res = true;

        callback(err, res);
      }
    });
  };

  self.a_hexists = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("hexists", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  //hincr name key [num] Increment the number stored at key in a hashmap by num
  self.hincr = function (name, key, num, callback) {
    if (typeof num == "function") {
      callback = num;
      num = 1;
    }

    self.request("hincr", [name, key, num], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  self.a_hincr = function (name, key, num) {
    num = parseInt(num) || 1;

    return new Promise((resolve, reject) => {
      self.request("hincr", [name, key, num], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  //hrlist name_start name_end limit List hashmap names in range (name_start, name_end].
  self.hrlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807; //max elements at hash
    }

    self.request("hrlist", [name_start, name_end, limit], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = [];
        for (var i = 1; i < resp.length; i++) {
          data.push(resp[i].toString());
        }
        callback(err, data);
      }
    });
  };

  self.a_hrlist = function (name_start, name_end, limit) {
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("hrlist", [name_start, name_end, limit], function (resp) {
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

  //hkeys name key_start key_end List keys of a hashmap in range (key_start, key_end].
  self.hkeys = function (name, key_start, key_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807; //max elements at hash
    }

    self.request("hkeys", [name, key_start, key_end, limit], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = [];
        for (var i = 1; i < resp.length; i++) {
          data.push(resp[i].toString());
        }
        callback(err, data);
      }
    });
  };

  self.a_hkeys = function (name, name_start, name_end, limit) {
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request(
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

  //hrscan name key_start key_end limit List key-value pairs with keys in range (key_start, key_end], in reverse order.
  self.hrscan = function (name, key_start, key_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807; //max elements at hash
    }

    self.request("hrscan", [name, key_start, key_end, limit], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length % 2 != 1) {
          callback("error");
        } else {
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          callback(err, data);
        }
      }
    });
  };

  //multi_hget name key1 key2 ... Get the values related to the specified multiple keys of a hashmap.
  self.multi_hget = function (name, keys, callback) {
    if (name && keys && keys.length) keys.unshift(name);

    self.request("multi_hget", keys, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = {};
        for (var i = 1; i < resp.length; i += 2) {
          data[resp[i].toString()] = resp[i + 1].toString();
        }
        callback(err, data);
      }
    });
  };

  //multi_hdel name key1 key2 ... Delete specified multiple keys in a hashmap.
  self.multi_hdel = function (name, keys, callback) {
    if (name && keys && keys.length) keys.unshift(name);

    self.request("multi_hdel", keys, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  //multi_hset name key1 value1 key2 value2 ... Set multiple key-value pairs(kvs) of a hashmap in one method call.
  self.multi_hset = function (name, kv, callback) {
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

    self.request("multi_hset", nkv, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };
};
