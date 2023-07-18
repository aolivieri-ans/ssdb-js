function build_buffer(arr) {
  let bs = [];
  let size = 0;
  for (let i = 0; i < arr.length; i++) {
    let arg = arr[i];
    if (arg instanceof Buffer) {
      //
    } else {
      arg = Buffer.from(arg.toString());
    }
    bs.push(arg);
    size += arg.length;
  }
  let ret = Buffer.alloc(size);
  let offset = 0;
  for (let i = 0; i < bs.length; i++) {
    bs[i].copy(ret, offset);
    offset += bs[i].length;
  }
  return ret;
}

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

module.exports = { build_buffer, memchr };
