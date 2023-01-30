exports.register = function (self) {
  ////////////////// Key Value

  //get key Get the value related to the specified key
  self.get = function (key, callback) {
    self.request("get", [key], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
    });
  };

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

  //set key value Set the value of the key.
  self.set = function (key, val, callback) {
    self.request("set", [key, val], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
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

  //setx key value ttl Set the value of the key, with a time to live.
  self.setx = function (key, val, ttl, callback) {
    if (!ttl) ttl = 0;
    ttl = parseInt(ttl);

    self.request("setx", [key, val, ttl], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
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

  //setnx key value Set the string value in argument as value of the key only if the key doesn"t exist.
  self.setnx = function (key, val, callback) {
    self.request("setnx", [key, val], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
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

  //expire key ttl Set the time left to live in seconds, only for keys of KV type.
  self.expire = function (key, ttl, callback) {
    if (!ttl) ttl = 0;
    ttl = parseInt(ttl);

    self.request("expire", [key, ttl], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
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

  //ttl key Returns the time left to live in seconds, only for keys of KV type.
  self.ttl = function (key, callback) {
    self.request("ttl", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
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

  //getset key value Sets a value and returns the previous entry at that key.
  self.getset = function (key, val, callback) {
    self.request("getset", [key, val], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
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

  //del key Delete specified key.
  self.del = function (key, callback) {
    self.request("del", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
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

  //incr key [num] Increment the number stored at key by num.
  self.incr = function (key, num, callback) {
    if (!num) num = 1;
    num = parseInt(num);

    self.request("incr", [key, num], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
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

  //exists key Verify if the specified key exists.
  self.exists = function (key, callback) {
    self.request("exists", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
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

  //bit operations @todo

  //substr key start size Return part of a string.
  self.substr = function (key, start, size, callback) {
    if (!start) start = 0;
    if (!size) size = 1;

    self.request("substr", [key, start, size], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
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

  //strlen key Return the number of bytes of a string.
  self.strlen = function (key, callback) {
    self.request("strlen", [key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
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

  //rkeys key_start key_end limit List keys in range (key_start, key_end], in reverse order.
  self.rkeys = function (key_start, key_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("rkeys", [key_start, key_end, limit], function (resp) {
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

  //rscan key_start key_end limit List key-value pairs with keys in range (key_start, key_end], in reverse order.
  self.rscan = function (key_start, key_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("rscan", [key_start, key_end, limit], function (resp) {
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

  //multi_set key1 value1 key2 value2 ... Set multiple key-value pairs(kvs) in one method call.
  self.multi_set = function (kv, callback) {
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
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
    });
  };

  //multi_get key1 key2 ... Get the values related to the specified multiple keys
  self.multi_get = function (k, callback) {
    self.request("multi_get", k, function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        var data = {};
        for (var i = 1; i < resp.length; i += 2) {
          data[resp[i].toString()] = resp[i + 1].toString();
        }
        callback(err, data);
      }
    });
  };

  //multi_del key1 key2 ... Delete specified multiple keys.
  self.multi_del = function (k, callback) {
    self.request("multi_del", k, function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, resp[1].toString());
      }
    });
  };

  //scan key_start key_end limit List key-value pairs with keys in range (key_start, key_end].
  self.scan = function (key_start, key_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("scan", [key_start, key_end, limit], function (resp) {
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

  self.a_scan = function (key_start, key_end, limit) {
    return new Promise((resolve, reject) => {
      self.request("scan", [key_start, key_end, limit], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length % 2 != 1) {
          reject("error");
          return;
        }
        if (err == 0) {
          var data = {};
          for (var i = 1; i < resp.length; i++) {
            data[resp[i].toString()] = resp[i + 1].toString();
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  //keys key_start key_end limit List keys in range (key_start, key_end].
  self.keys = function (key_start, key_end, limit, callback) {
    self.request("keys", [key_start, key_end, limit], function (resp) {
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
