exports.register = function (self) {
  //auth password Authenticate the connection.
  self.auth = function (passw, callback) {
    self.request("auth", [passw], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];

        callback(err);
      }
    });
  };

  //dbsize Return the approximate size of the database. In bytes
  self.dbsize = function (callback) {
    self.request("dbsize", [name, key, num], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //flushdb [type] Delete all data in ssdb server.
  self.flushdb = function (type, callback) {
    if (!type) type = "";
    if (["", "kv", "hash", "zset", "list"].indexOf(type) == -1) type = "";

    self.request("flushdb", [type], function (resp) {
      if (callback) {
        let err = resp[0] == "ok" ? 0 : resp[0];

        callback(err);
      }
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

  //info [opt] Return the information of server.
  self.info = function (opt, callback) {
    if (!opt) opt = "";
    self.request("info", [opt], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        var data = [];

        for (var i = 1; i < resp.length; i++) {
          var k = resp[i].toString();
          data.push(k);
        }

        callback(err, data);
      }
    });
  };

  //slaveof id host port [auth last_seq last_key] Start a replication slave.
  self.slaveof = function (id, host, port, auth, last_seq, last_key, callback) {
    if (!last_seq) last_seq = "";
    if (!last_key) last_key = "";
    if (!auth) auth = "";
    if (!port) port = 8888;

    self.request(
      "slaveof",
      [id, host, port, auth, last_seq, last_key],
      function (resp) {
        if (callback) {
          let err = resp[0] == "ok" ? 0 : resp[0];

          callback(err);
        }
      }
    );
  };
};
