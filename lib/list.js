exports.register = function (self) {
  self.a_qpush_front = function (name, ...elems) {
    return new Promise((resolve, reject) => {
      elems.unshift(name);
      self.request("qpush_front", elems, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qpush = async function (name, ...elems) {
    return self.a_qpush_back(name, ...elems);
  };

  self.a_qpush_back = function (name, ...elems) {
    return new Promise((resolve, reject) => {
      elems.unshift(name);
      self.request("qpush_back", elems, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qpop_front = function (name, size) {
    size = size || 1;
    return new Promise((resolve, reject) => {
      self.request("qpop_front", [name, size], function (resp) {
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
  self.a_qpop = async function (name, ...elems) {
    return self.a_qpop_back(name, ...elems);
  };

  self.a_qpop_back = function (name, size) {
    size = size || 1;
    return new Promise((resolve, reject) => {
      self.request("qpop_back", [name, size], function (resp) {
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

  self.a_qfront = function (name) {
    return new Promise((resolve, reject) => {
      self.request("qfront", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qback = function (name) {
    return new Promise((resolve, reject) => {
      self.request("qback", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qsize = function (name) {
    return new Promise((resolve, reject) => {
      self.request("qsize", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1]));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qclear = function (name) {
    return new Promise((resolve, reject) => {
      self.request("qclear", name, function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve("ok");
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qget = function (name, idx) {
    return new Promise((resolve, reject) => {
      self.request("qget", [name, idx], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[1].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qset = function (name, idx, val) {
    return new Promise((resolve, reject) => {
      self.request("qset", [name, idx, val], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(resp[0].toString());
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qrange = function (name, offset, limit) {
    return new Promise((resolve, reject) => {
      self.request("qrange", [name, offset, limit], function (resp) {
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

  self.a_qslice = function (name, begin, end) {
    return new Promise((resolve, reject) => {
      self.request("qslice", [name, begin, end], function (resp) {
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

  self.a_qtrim_front = function (name, size) {
    return new Promise((resolve, reject) => {
      self.request("qtrim_front", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qtrim_back = function (name, size) {
    return new Promise((resolve, reject) => {
      self.request("qtrim_back", [name, size], function (resp) {
        let err = resp[0] == "ok" ? 0 : resp[0];
        if (err == 0) {
          resolve(parseInt(resp[1].toString()));
        } else {
          reject(err);
        }
      });
    });
  };

  self.a_qlist = function (name_start, name_end, limit) {
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("qlist", [name_start, name_end, limit], function (resp) {
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

  self.a_qrlist = function (name_start, name_end, limit) {
    name_start = name_start || "";
    name_end = name_end || "";
    limit = limit || 1024;
    return new Promise((resolve, reject) => {
      self.request("qrlist", [name_start, name_end, limit], function (resp) {
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
};
