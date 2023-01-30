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

  //zset name key score Set the score of the key of a zset.
  self.zset = function (name, key, score, callback) {
    self.request("zset", [name, key, score], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
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

  //zlist name_start name_end limit List zset names in range (name_start, name_end].
  self.zlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("zlist", [name_start, name_end, limit], function (resp) {
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

  //zsum name score_start score_end Returns the sum of elements of the sorted set stored at the specified key which have scores in the range [score_start,score_end].
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

  //zclear name Delete all keys in a zset.
  self.zclear = function (name, callback) {
    self.request("zclear", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err);
      }
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

  //zrank name key Returns the rank(index) of a given key in the specified sorted set.
  self.zrank = function (name, key, callback) {
    self.request("zrank", [name, key], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
    });
  };

  //zrrank name key Returns the rank(index) of a given key in the specified sorted set, in reverse order.
  //@todo fix returned results
  self.zrrank = function (name, key, callback) {
    self.request("zrank", [name, key], function (resp) {
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

  //zcount name score_start score_end Returns the number of elements of the sorted set stored at the specified key which have scores in the range [score_start,score_end].
  self.zcount = function (name, score_start, score_end, callback) {
    self.request("zcount", [name, score_start, score_end], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
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

  //zpop_back name limit Delete limit elements from back of the zset.
  self.zpop_back = function (name, limit, callback) {
    self.request("zpop_back", [name, parseInt(limit)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1]));
      }
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

  //zrange name offset limit Returns a range of key-score pairs by index range [offset, offset + limit).
  self.zrange = function (name, offset, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
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

  //zrrange name offset limit Returns a range of key-score pairs by index range [offset, offset + limit), in reverse order.
  self.zrrange = function (name, offset, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }
    self.request(
      "zrrange",
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
};
