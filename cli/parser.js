class SSDB_Response {

    constructor(code = '', data_or_message = null) {
        this.type = 'none';
        this.code = code;
        this.data = null;
        this.message = null;
        this.set(code, data_or_message);
    }

    ok() {
        return this.code == 'ok';
    }

    not_found() {
        return this.message == 'not_found';
    }

    set(code, data_or_message = null) {
        this.code = code;
        if (code == 'ok') {
            this.data = data_or_message;
        } else {
            if (Array.isArray(data_or_message)) {
                if (data_or_message.length > 0) {
                    this.message = data_or_message[0];
                }
            } else {
                this.message = data_or_message;
            }
        }
    }


    static parseCmdResponse(cmd, resp) {

        let r = new SSDB_Response();

        function int_resp(resp) {
            r.type = 'val';
            if (resp[0] == 'ok') {
                if (resp.length == 2) {
                    try {
                        let val = parseInt(resp[1]);
                        r.set('ok', val);
                    } catch (error) {
                        r.set('server_error', `Invalid response parseInt: ${resp}`);
                    }
                } else {
                    r.set('server_error', `Invalid response: ${resp}`);
                }
            } else {
                r.set(resp[0], resp.slice(1));
            }
            return r;
        }

        function float_resp(resp) {
            r.type = 'val';
            if (resp[0] == 'ok') {
                if (resp.length == 2) {
                    try {
                        let val = parseFloat(resp[1]);
                        r.set('ok', val);
                    } catch (e) {
                        r.set('server_error', `Invalid response: ${resp}`);
                    }
                } else {
                    r.set('server_error', `Invalid response: ${resp}`);
                }
            } else {
                r.set(resp[0], resp.slice(1));
            }
            return r;
        }

        function str_resp(resp) {
            r.type = 'val';
            if (resp[0] == 'ok') {
                if (resp.length == 2) {
                    r.set('ok', resp[1]);
                } else {
                    r.set('server_error', `Invalid response: ${resp}`);
                }
            } else {
                r.set(resp[0], resp.slice(1));
            }
            return r;
        }

        function list_resp(resp) {
            r.type = 'list';
            r.set(resp[0], resp.slice(1));
            return r;
        }

        function str_map_resp(resp) {
            r.type = 'map';
            if (resp[0] == 'ok') {
                if (resp.length % 2 == 1) {
                    let data = { 'index': [], 'items': {} };
                    for (let i = 1; i < resp.length; i += 2) {
                        let k = resp[i];
                        let v = resp[i + 1];
                        data['index'].push(k);
                        data['items'][k] = v;
                    }
                    r.set('ok', data);
                } else {
                    r.set('server_error', `Invalid response: ${resp}`);
                }
            } else {
                r.set(resp[0], r.shift());
            }
            return r;
        }

        function int_map_resp(resp) {
            r.type = 'map';
            if (resp[0] == 'ok') {
                if (resp.length % 2 == 1) {
                    let data = { 'index': [], 'items': {} };
                    for (let i = 1; i < resp.length; i += 2) {
                        let k = resp[i];
                        let v = resp[i + 1];
                        try {
                            v = parseInt(v);
                        } catch (err) {
                            v = -1;
                        }
                        data['index'].push(k);
                        data['items'][k] = v;
                    }
                    r.set('ok', data);
                } else {
                    r.set('server_error', `Invalid response: ${resp}`);
                }
            } else {
                r.set(resp[0], r.shift());
            }
            return r;
        }


        ///////////////////////////////////////////
        if (["ping", "set", "del", "qset", "zset", "qset", "hset", "qpush", "qpush_front", "qpush_back", "zdel", "hdel",
            "multi_set", "multi_hset", "multi_hdel", "multi_zset", "multi_zdel"
        ].includes(cmd)) {
            if (resp.length > 1) {
                return int_resp(resp);
            } else {
                return new SSDB_Response(resp[0], null);
            }
        }

        if (["version", "substr", "get", "getset", "hget", "qfront", "qback", "qget"].includes(cmd)) {
            return str_resp(resp);
        }

        if (["qpop", "qpop_front", "qpop_back"].includes(cmd)) {
            let size = 1;
            try {
                size = parseInt(params[2]);
            } catch (error) {
            }

            if (size == 1)
                return str_resp(resp);

            else
                return list_resp(resp);
        }

        if (["dbsize", "getbit", "setbit", "countbit", "bitcount", "strlen", "ttl", "expire", "setnx", "incr",
            "decr", "zincr", "zdecr", "hincr", "hdecr", "hsize", "zsize", "qsize", "zget", "zrank", "zrrank",
            "zsum", "zcount", "zremrangebyrank", "zremrangebyscore", "hclear", "zclear", "qclear", "qpush",
            "qpush_front", "qpush_back", "qtrim_front", "qtrim_back"
        ].includes(cmd)) {
            return int_resp(resp);
        }

        if (["zavg", "hincrbyfloat"].includes(cmd)) {
            return float_resp(resp);
        }

        if (["keys", "rkeys", "zkeys", "zrkeys", "hkeys",
            "hrkeys", "list", "hlist", "hrlist", "zlist",
            "zrlist"].includes(cmd)) {
            return list_resp(resp);
        }

        if (["scan", "rscan", "hgetall", "hscan", "hrscan"].includes(cmd)) {
            return str_map_resp(resp);
        }

        if (["zscan", "zrscan", "zrange", "zrrange", "zpop_front", "zpop_back"].includes(cmd)) {
            return int_map_resp(resp);
        }

        if (["auth", "exists", "hexists", "zexists"].includes(cmd)) {
            return int_resp(resp);
        }

        if (["multi_exists", "multi_hexists", "multi_zexists"].includes(cmd)) {
            return int_map_resp(resp);
        }

        if (["multi_get", "multi_hget"].includes(cmd)) {
            return str_map_resp(resp);
        }

        if (["multi_hsize", "multi_zsize", "multi_zget"].includes(cmd)) {
            return int_map_resp(resp);
        }

        // default
        return list_resp(resp);

    }

}

module.exports = {
    SSDB_Response
}

