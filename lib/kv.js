exports.register = function (self) {
  ////////////////// Key Value

  self.a_get = async function (key) {
    return new Promise((resolve, reject) => {
      self.request("get", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_set = async function (key, val) {
    return new Promise((resolve, reject) => {
      self.request("set", [key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_setx = async function (key, val, ttl) {
    return new Promise((resolve, reject) => {
      self.request("setx", [key, val, ttl], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_setnx = async function (key, val) {
    return new Promise((resolve, reject) => {
      self.request("setnx", [key, val], function (resp) {
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

  self.a_expire = async function (key, ttl) {
    return new Promise((resolve, reject) => {
      self.request("expire", [key, ttl], function (resp) {
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

  self.a_ttl = async function (key) {
    return new Promise((resolve, reject) => {
      self.request("ttl", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_getset = async function (key, val) {
    return new Promise((resolve, reject) => {
      self.request("getset", [key, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_del = async function (key) {
    return new Promise((resolve, reject) => {
      self.request("del", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_incr = function (key, num) {
    if (!num) num = 1;
    num = parseInt(num);

    return new Promise((resolve, reject) => {
      self.request("incr", [key, num], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_exists = function (key) {
    return new Promise((resolve, reject) => {
      self.request("exists", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_substr = function (key, start, size) {
    return new Promise((resolve, reject) => {
      self.request("substr", [key, start, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_strlen = function (key) {
    return new Promise((resolve, reject) => {
      self.request("strlen", [key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_rkeys = function (key_start, key_end, limit) {
    return new Promise((resolve, reject) => {
      self.request("rkeys", [key_start, key_end, limit], function (resp) {
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

  self.a_rscan = async function (key_start, key_end, limit) {
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("rscan", [key_start, key_end, limit], function (resp) {
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

  self.a_multi_set = async function (kv) {
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
      self.request("multi_set", nkv, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_multi_get = async function (keyz) {
    return new Promise((resolve, reject) => {
      self.request("multi_get", keyz, function (resp) {
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

  self.a_multi_del = function (keyz) {
    return new Promise((resolve, reject) => {
      self.request("multi_del", keyz, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_scan = async function (key_start, key_end, limit) {
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("scan", [key_start, key_end, limit], function (resp) {
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

  self.a_keys = function (key_start, key_end, limit) {
    return new Promise((resolve, reject) => {
      self.request("keys", [key_start, key_end, limit], function (resp) {
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
};
