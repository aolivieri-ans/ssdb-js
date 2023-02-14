exports.register = function (self) {
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

  self.a_zincr = function (name, key, num) {
    return new Promise((resolve, reject) => {
      self.request("zincr", [name, key, num], function (resp) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        resolve(err);
      });
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

  self.a_zpop_front = function (name, limit) {
    limit = parseInt(limit) || 1;
    return new Promise((resolve, reject) => {
      self.request("zpop_front", [name, parseInt(limit)], function (resp) {
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

  self.a_zpop_back = function (name, limit) {
    limit = parseInt(limit) || 1;
    return new Promise((resolve, reject) => {
      self.request("zpop_back", [name, limit], function (resp) {
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

  self.a_zremrangebyrank = function (name, start_rank, end_rank) {
    start_rank = parseInt(start_rank);
    end_rank = parseInt(end_rank);
    return new Promise((resolve, reject) => {
      self.request(
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

  self.a_zremrangebyscore = function (name, start_score, end_score) {
    start_score = parseInt(start_score);
    end_score = parseInt(end_score);
    return new Promise((resolve, reject) => {
      self.request(
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

  self.a_multi_zget = function (name, k) {
    return new Promise((resolve, reject) => {
      self.request("multi_zget", [name, ...k], function (resp) {
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
