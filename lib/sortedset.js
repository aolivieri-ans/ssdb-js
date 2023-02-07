exports.register = function (self) {
  //zget name key Get the score related to the specified key of a zset
  self.zget = function (name, key, callback) {
    self.request("zget", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          callback(err, parseInt(resp[1]));
        } else {
          var score = 0;
          callback("error");
        }
      }
    });
  };

  self.a_zget = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("zget", [name, key], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zsize name Return the number of pairs of a zset.
  self.zsize = function (name, callback) {
    self.request("zsize", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          callback(err, parseInt(resp[1]));
        } else {
          var score = 0;
          callback("error");
        }
      }
    });
  };

  self.a_zsize = function (name) {
    return new Promise((resolve, reject) => {
      self.request("zsize", [name], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zset name key score Set the score of the key of a zset.
  self.zset = function (name, key, score, callback) {
    self.request("zset", [name, key, score], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_zset = function (name, key, score) {
    return new Promise((resolve, reject) => {
      self.request("zset", [name, key, score], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };
  //zdel name key Delete specified key of a zset.
  self.zdel = function (name, key, callback) {
    self.request("zdel", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_zdel = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("zdel", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zscan name key_start score_start score_end limit List key-score pairs where key-score in range (key_start+score_start, score_end].
  self.zscan = function (
    name,
    key_start,
    score_start,
    score_end,
    limit,
    callback
  ) {
    self.request(
      "zscan",
      [name, key_start, score_start, score_end, limit],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (resp.length % 2 != 1) {
            callback("error");
          } else {
            var data = {};
            for (var i = 1; i < resp.length; i += 2) {
              data[resp[i].toString()] = parseInt(resp[i + 1]);
            }
            callback(err, data);
          }
        }
      }
    );
  };

  self.a_zscan = function (name, key_start, score_start, score_end, limit) {
    key_start = key_start || "";
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self.request(
        "zscan",
        [name, key_start, score_start, score_end, limit],
        function (resp) {
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
        }
      );
    });
  };

  //zlist name_start name_end limit List zset names in range (name_start, name_end].
  self.zlist = function (name_start, name_end, limit, callback) {
    self.request(
      "zlist",
      [name_start, name_end, limit, callback],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          console.log(...resp);
          callback(err, data);
        }
      }
    );
  };
  self.a_zlist = function (name_start, name_end, limit) {
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("zlist", [name_start, name_end, limit], function (resp) {
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
  self.a_zsum = function (name, score_start, score_end) {
    score_start = !isNaN(parseInt(score_start)) ? parseInt(score_start) : "";
    score_end = !isNaN(parseInt(score_end)) ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self.request("zsum", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  self.zsum = function (name, score_start, score_end, callback) {
    self.request("zsum", [name, score_start, score_end], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          callback(err, parseInt(resp[1]));
        } else {
          callback("error");
        }
      }
    });
  };

  //zavg name score_start score_end Returns the average of elements of the sorted set stored at the specified key which have scores in the range [score_start,score_end].
  self.zavg = function (name, score_start, score_end, callback) {
    self.request("zavg", [name, score_start, score_end], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (resp.length == 2) {
          callback(err, parseInt(resp[1]));
        } else {
          callback("error");
        }
      }
    });
  };

  self.a_zavg = function (name, score_start, score_end) {
    score_start = !isNaN(parseInt(score_start)) ? parseInt(score_start) : "";
    score_end = !isNaN(parseInt(score_end)) ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self.request("zavg", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseFloat(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zclear name Delete all keys in a zset.
  self.zclear = function (name, callback) {
    self.request("zclear", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_zclear = function (name) {
    return new Promise((resolve, reject) => {
      self.request("zclear", name, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zexists name key Verify if the specified key exists in a zset.
  self.zexists = function (name, key, callback) {
    self.request("zexists", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  self.a_zexists = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("zexists", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zincr name key num Increment the number stored at key in a zset by num.
  self.zincr = function (name, key, num, callback) {
    num = parseInt(num);
    self.request("zincr", [name, key, num], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_zincr = function (name, key, num) {
    return new Promise((resolve, reject) => {
      self.request("zincr", [name, key, num], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        resolve(err);
      });
    });
  };

  //zrlist name_start name_end limit List zset names in range (name_start, name_end], in reverse order.
  self.zrlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("zrlist", [name_start, name_end, limit], function (resp) {
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

  self.a_zrlist = function (name_start, name_end, limit) {
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("zrlist", [name_start, name_end, limit], function (resp) {
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

  //zkeys name key_start score_start score_end limit List keys in a zset.
  self.zkeys = function (
    name,
    key_start,
    score_start,
    score_end,
    limit,
    callback
  ) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request(
      "zkeys",
      [name, key_start, score_start, score_end, limit],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          var data = [];
          for (var i = 1; i < resp.length; i++) {
            data.push(resp[i].toString());
          }
          callback(err, data);
        }
      }
    );
  };

  self.a_zkeys = function (name, key_start, score_start, score_end, limit) {
    key_start = key_start || "";
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self.request(
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

  //zrscan name key_start score_start score_end limit List key-score pairs of a zset, in reverse order. See method zkeys().
  self.zrscan = function (
    name,
    key_start,
    score_start,
    score_end,
    limit,
    callback
  ) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request(
      "zrscan",
      [name, key_start, score_start, score_end, limit],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (resp.length % 2 != 1) {
            callback("error");
          } else {
            var data = {};
            for (var i = 1; i < resp.length; i += 2) {
              data[resp[i].toString()] = parseInt(resp[i + 1]);
            }
            callback(err, data);
          }
        }
      }
    );
  };

  self.a_zrscan = function (name, key_start, score_start, score_end, limit) {
    key_start = key_start || "";
    score_start = score_start || "";
    score_end = score_end || "";
    limit = limit || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self.request(
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

  //zrank name key Returns the rank(index) of a given key in the specified sorted set.
  self.zrank = function (name, key, callback) {
    self.request("zrank", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  self.a_zrank = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("zrank", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zrrank name key Returns the rank(index) of a given key in the specified sorted set, in reverse order.
  //@todo fix returned results
  self.zrrank = function (name, key, callback) {
    self.request("zrrank", [name, key], function (resp) {
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

  self.a_zrrank = function (name, key) {
    return new Promise((resolve, reject) => {
      self.request("zrrank", [name, key], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zcount name score_start score_end Returns the number of elements of the sorted set stored at the specified key which have scores in the range [score_start,score_end].
  self.zcount = function (name, score_start, score_end, callback) {
    self.request("zcount", [name, score_start, score_end], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  self.a_zcount = function (name, score_start, score_end) {
    score_start = parseInt(score_start) >= 0 ? parseInt(score_start) : "";
    score_end = parseInt(score_end) >= 0 ? parseInt(score_end) : "";
    return new Promise((resolve, reject) => {
      self.request("zcount", [name, score_start, score_end], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //zpop_front name limit Delete limit elements from front of the zset.
  self.zpop_front = function (name, limit, callback) {
    self.request("zpop_front", [name, parseInt(limit)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  self.a_zpop_front = function (name, limit) {
    return new Promise((resolve, reject) => {
      self.request("zpop_front", [name, parseInt(limit)], function (resp) {
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
      });
    });
  };

  //zpop_back name limit Delete limit elements from back of the zset.
  self.zpop_back = function (name, limit, callback) {
    self.request("zpop_back", [name, parseInt(limit)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  self.a_zpop_back = function (name, limit) {
    return new Promise((resolve, reject) => {
      self.request("zpop_back", [name, parseInt(limit)], function (resp) {
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
      });
    });
  };

  //zremrangebyrank name start end Delete the elements of the zset which have rank in the range [start,end].

  self.zremrangebyrank = function (name, start, end, callback) {
    self.request(
      "zremrangebyrank",
      [name, parseInt(start), parseInt(end)],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          callback(err, parseInt(resp[1]));
        }
      }
    );
  };

  self.a_zremrangebyrank = function (name, start, end) {
    return new Promise((resolve, reject) => {
      self.request(
        "zremrangebyrank",
        [name, parseInt(start), parseInt(end)],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            resolve([err, parseInt(resp[1])]);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  //zremrangebyscore name start end Delete the elements of the zset which have score in the range [start,end].
  self.zremrangebyscore = function (name, start, end, callback) {
    self.request(
      "zremrangebyscore",
      [name, parseInt(start), parseInt(end)],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          callback(err, parseInt(resp[1]));
        }
      }
    );
  };

  self.a_zremrangebyscore = function (name, start, end) {
    return new Promise((resolve, reject) => {
      self.request(
        "zremrangebyscore",
        [name, parseInt(start), parseInt(end)],
        function (resp) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          if (err == 0) {
            resolve([err, parseInt(resp[1])]);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  //multi_zset name key1 score1 key2 score2 ... Set multiple key-score pairs(kvs) of a zset in one method call.
  self.multi_zset = function (name, ks, callback) {
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
    self.request("multi_zset", nks, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };

  self.a_multi_zset = function (name, ks) {
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
      self.request("multi_zset", nks, function (resp) {
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

  //multi_zdel name key1 key2 ... Delete specified multiple keys of a zset.
  self.multi_zdel = function (name, k, callback) {
    k.unshift(name);
    self.request("multi_zdel", k, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
    });
  };
  /** multi_zdel expects an array as second argument */
  self.a_multi_zdel = function (name, k) {
    k.unshift(name);
    return new Promise((resolve, reject) => {
      self.request("multi_zdel", k, function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  //multi_zget name key1 key2 ... Get the values related to the specified multiple keys of a zset.
  self.multi_zget = function (name, k, callback) {
    k.unshift(name);
    self.request("multi_zget", k, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = {};
        for (var i = 1; i < resp.length; i += 2) {
          data[resp[i].toString()] = parseInt(resp[i + 1]);
        }
        callback(err, data);
      }
    });
  };

  self.a_multi_zget = function (name, k) {
    k.unshift(name);
    return new Promise((resolve, reject) => {
      self.request("multi_zget", k, function (resp) {
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
      });
    });
  };

  //zrange name offset limit Returns a range of key-score pairs by index range [offset, offset + limit).
  self.zrange = function (name, offset, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807n;
    }
    self.request(
      "zrange",
      [name, parseInt(offset), parseInt(limit)],
      function (resp) {
        if (callback) {
          var err = resp[0] == "ok" ? 0 : resp[0];
          var data = {};
          for (var i = 1; i < resp.length; i += 2) {
            data[resp[i].toString()] = parseInt(resp[i + 1]);
          }
          callback(err, data);
        }
      }
    );
  };

  self.a_zrange = function (name, offset, limit) {
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self.request("zrange", [name, offset, limit], function (resp) {
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
  //zrrange name offset limit Returns a range of key-score pairs by index range [offset, offset + limit), in reverse order.
  self.zrrange = function (name, offset, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }
    self.request("zrange", [name, offset, limit], function (resp) {
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
  };

  self.a_zrrange = function (name, offset, limit) {
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 9223372036854775807n;
    return new Promise((resolve, reject) => {
      self.request("zrrange", [name, offset, limit], function (resp) {
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
};
