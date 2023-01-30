exports.register = function (self) {
  //qpush_front name item1 item2 ... Adds one or more than one element to the head of the queue.
  self.qpush_front = function (name, v, callback) {
    console.log(typeof v);

    if (typeof v == "array") v.unshift(name);
    else v = [name, v];

    self.request("qpush_front", v, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //qpush name item1 item2 ... Alias of `qpush_back`.
  self.qpush = function (name, v, callback) {
    self.qpush_front(name, v, callback);
  };

  //qpush_back name item1 item2 ... Adds an or more than one element to the end of the queue.
  self.qpush_back = function (name, v, callback) {
    if (typeof v == "array") v.unshift(name);
    else v = [name, v];

    self.request("qpush_back", v, function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];
        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //qpop_front name size Pop out one or more elements from the head of a queue.
  self.qpop_front = function (name, size, callback) {
    size = parseInt(size);

    self.request("qpop_front", [name, size], function (resp) {
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

  //qpop name size Alias of `qpop_front`.
  self.qpop = function (name, size, callback) {
    self.qpop_front(name, size, callback);
  };

  //qpop_back name size Pop out one or more elements from the tail of a queue.
  self.qpop_back = function (name, size, callback) {
    size = parseInt(size);

    self.request("qpop_back", [name, size], function (resp) {
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

  //qfront name Returns the first element of a queue.
  self.qfront = function (name, callback) {
    self.request("qfront", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, resp[1].toString());
      }
    });
  };

  //qback name Returns the last element of a queue.
  self.qback = function (name, callback) {
    self.request("qback", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, resp[1].toString());
      }
    });
  };

  //qsize name Returns the number of items in the queue.
  self.qsize = function (name, callback) {
    self.request("qsize", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //qclear name Clear the queue.
  self.qclear = function (name, callback) {
    self.request("qclear", [name], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err);
      }
    });
  };

  //qget name index Returns the element a the specified index(position).
  self.qget = function (name, index, callback) {
    self.request("qget", [name, parseInt(index)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, resp[1].toString());
      }
    });
  };

  //qset name index val Description
  self.qset = function (name, index, val, callback) {
    self.request("qset", [name, parseInt(index), val], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, resp[1].toString());
      }
    });
  };

  //qrange name offset limit Returns a portion of elements from the queue at the specified range [offset, offset + limit].
  self.qrange = function (name, offset, limit, callback) {
    limit = parseInt(limit);
    offset = parseInt(offset);

    self.request("qrange", [name, offset, limit], function (resp) {
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

  //qslice name begin end Returns a portion of elements from the queue at the specified range [begin, end].
  self.qslice = function (name, offset, limit, callback) {
    limit = parseInt(limit);
    offset = parseInt(offset);

    self.request("qslice", [name, offset, limit], function (resp) {
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

  //qtrim_front name size Remove multi elements from the head of a queue.
  self.qtrim_front = function (name, size, callback) {
    self.request("qtrim_front", [name, parseInt(size)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //qtrim_back name size Remove multi elements from the tail of a queue.
  self.qtrim_back = function (name, size, callback) {
    self.request("qtrim_back", [name, parseInt(size)], function (resp) {
      if (callback) {
        var err = resp[0] == "ok" ? 0 : resp[0];

        callback(err, parseInt(resp[1].toString()));
      }
    });
  };

  //qlist name_start name_end limit List list/queue names in range (name_start, name_end].
  self.qlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("qlist", [name_start, name_end, limit], function (resp) {
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

  //qrlist name_start name_end limit List list/queue names in range (name_start, name_end], in reverse order.
  self.qrlist = function (name_start, name_end, limit, callback) {
    if (typeof limit == "function") {
      callback = limit;
      limit = 9223372036854775807;
    }

    self.request("qrlist", [name_start, name_end, limit], function (resp) {
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
};
