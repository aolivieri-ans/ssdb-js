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

  self.a_hscan = function (name, key_start, key_end, limit) {
    key_start = key_start || "";
    key_end = key_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("hscan", [name, key_start, key_end, limit], function (resp) {
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

  self.a_hclear = function (name) {
    return new Promise((resolve, reject) => {
      self.request("hclear", [name], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
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

  self.a_hrscan = function (name, key_start, key_end, limit) {
    key_start = key_start || "";
    key_end = key_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request(
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

  self.a_multi_hget = async function (name, keyz) {
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
      self.request("multi_hget", nkv, function (resp) {
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

  self.a_multi_hdel = function (name, keyz) {
    return new Promise((resolve, reject) => {
      let nkv = [];
      if (name && keyz.length > 0) {
        nkv.push(name);
        keyz.forEach(function (k) {
          nkv.push(k);
        });
      }
      self.request("multi_hdel", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_multi_hset = async function (name, kv) {
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
      self.request("multi_hset", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };
};
