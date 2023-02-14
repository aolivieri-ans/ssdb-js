exports.register = function (self) {
  self.a_compact = async function () {
    return new Promise((resolve, reject) => {
      self.request("compact", [], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_dbsize = function () {
    return new Promise((resolve, reject) => {
      self.request("dbsize", [], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_flushdb = async function (type) {
    return new Promise((resolve, reject) => {
      if (!type) type = "";
      if (["", "kv", "hash", "zset", "list"].indexOf(type) == -1) type = "";

      self.request("flushdb", [type], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_info = async function (opt) {
    let opts = opt ? [opt] : [];
    return new Promise((resolve, reject) => {
      self.request("info", opts, function (resp) {
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
};
