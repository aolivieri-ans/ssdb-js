/**
 * Copyright (c) 2013, ideawu
 * All rights reserved.
 * @author: ideawu
 * @link: http://www.ideawu.com/
 *
 * SSDB nodejs client SDK.
 */

var net = require("net");

// timeout: microseconds, if ommitted, it will be treated as listener
// option = unix path or {host, port, timeout}
// callback(err, ssdb)
exports.connect = function (opts, listener) {
  var self = this;
  var recv_buf = Buffer.alloc(0);
  var callbacks = [];
  var connected = false;

  //timeout = timeout || 0;
  //listener = listener || function(){};

  optz = {};
  optz.port = parseInt(opts.port) || 8888;
  optz.host = opts.host || "localhost";
  optz.sock_timeout = parseInt(opts.sock_timeout) || 0;

  var sock = new net.Socket();
  sock.on("error", function (e) {
    if (!connected) {
      listener("connect_failed", e);
    } else {
      var callback = callbacks.shift();
      if (callback) callback(["error"]);
    }
  });

  sock.on("data", function (data) {
    recv_buf = build_buffer([recv_buf, data]);
    while (recv_buf.length > 0) {
      var resp = parse();
      if (!resp) {
        break;
      }
      resp[0] = resp[0].toString();
      var callback = callbacks.shift();
      callback(resp);
    }
  });

  sock.connect(optz, function () {
    connected = true;
    sock.setNoDelay(true);
    sock.setKeepAlive(true);
    sock.setTimeout(optz.sock_timeout);
    listener(0, self);
  });

  self.close = function () {
    sock.end();
  };

  self.request = function (cmd, params, callback) {
    callbacks.push(callback || function () {});
    var arr = [cmd].concat(params);
    self.send_request(arr);
  };

  function build_buffer(arr) {
    var bs = [];
    var size = 0;
    for (var i = 0; i < arr.length; i++) {
      var arg = arr[i];
      if (arg instanceof Buffer) {
        //
      } else {
        arg = Buffer.from(arg.toString());
      }
      bs.push(arg);
      size += arg.length;
    }
    var ret = Buffer.alloc(size);
    var offset = 0;
    for (var i = 0; i < bs.length; i++) {
      bs[i].copy(ret, offset);
      offset += bs[i].length;
    }
    return ret;
  }

  self.send_request = function (params) {
    var bs = [];
    for (var i = 0; i < params.length; i++) {
      var p = params[i];
      var len = 0;
      if (!(p instanceof Buffer)) {
        p = p.toString();
        bs.push(Buffer.byteLength(p));
      } else {
        bs.push(p.length);
      }
      bs.push("\n");
      bs.push(p);
      bs.push("\n");
    }
    bs.push("\n");

    sock.write(build_buffer(bs));
    //console.log('write ' + req.length + ' bytes');
    //console.log('write: ' + req);
  };

  function memchr(buf, ch, start) {
    start = start || 0;
    ch = typeof ch == "string" ? ch.charCodeAt(0) : ch;
    for (var i = start; i < buf.length; i++) {
      if (buf[i] == ch) {
        return i;
      }
    }
    return -1;
  }

  function parse() {
    var ret = [];
    var spos = 0;
    var pos;
    //console.log('parse: ' + recv_buf.length + ' bytes');
    while (true) {
      //pos = recv_buf.indexOf('\n', spos);
      pos = memchr(recv_buf, "\n", spos);
      if (pos == -1) {
        // not finished
        return null;
      }
      var line = recv_buf.slice(spos, pos).toString();
      spos = pos + 1;
      line = line.replace(/^\s+(.*)\s+$/, "$&");
      if (line.length == 0) {
        // parse end
        //recv_buf = recv_buf.substr(spos);
        recv_buf = recv_buf.slice(spos);
        break;
      }
      var len = parseInt(line);
      if (isNaN(len)) {
        // error
        console.log("error 1");
        return null;
      }
      if (spos + len > recv_buf.length) {
        // not finished
        //console.log(spos + len, recv_buf.length);
        //console.log('not finish');
        return null;
      }
      //var data = recv_buf.substr(spos, len);
      var data = recv_buf.slice(spos, spos + len);
      spos += len;
      ret.push(data);

      //pos = recv_buf.indexOf('\n', spos);
      pos = memchr(recv_buf, "\n", spos);
      if (pos == -1) {
        // not finished
        console.log("error 3");
        return null;
      }
      // '\n', or '\r\n'
      //if(recv_buf.charAt(spos) != '\n' && recv_buf.charAt(spos) != '\r' && recv_buf.charAt(spos+1) != '\n'){
      var cr = "\r".charCodeAt(0);
      var lf = "\n".charCodeAt(0);
      if (
        recv_buf[spos] != lf &&
        recv_buf[spos] != cr &&
        recv_buf[spos + 1] != lf
      ) {
        // error
        console.log("error 4 " + recv_buf[spos]);
        return null;
      }
      spos = pos + 1;
    }
    return ret;
  }

  // callback(err, val);
  // err: 0 on sucess, or error_code(string) on error

  ////////////////// Sorted set

  ////////////////// Hash

  ////////////////// List

  ////////////////// Server command

  ////////////////// IP Filter  @todo

  require("./lib/sortedset").register(self);
  require("./lib/kv").register(self);
  require("./lib/hashmap").register(self);
  require("./lib/list").register(self);
  require("./lib/server").register(self);

  return self;
};
