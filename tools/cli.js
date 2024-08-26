#!/usr/bin/env node

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  

const prompt = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };

const { SSDBClient } = require("../index");

class SSDB_Response {

    constructor(code='', data_or_message=null){
		this.type = 'none';
		this.code = code;
		this.data = null;
		this.message = null;
		this.set(code, data_or_message);
	}

    ok(){
        return this.code == 'ok'
    }

    not_found() {
        return this.message == 'not_found'
    }

    set(code, data_or_message=null){
        this.code = code;
		if(code == 'ok'){
			this.data = data_or_message;
		}else{
			if(Array.isArray(data_or_message)){
				if(data_or_message.length > 0){
					this.message = data_or_message[0];
				}
			}else{
				this.message = data_or_message;
			}
		}
    }

}

function parseResponse(cmd, resp){

    let r = new SSDB_Response()

    function int_resp(resp){
		r.type = 'val';
		if(resp[0] == 'ok'){
			if(resp.length == 2){
				try{
					val = parseInt(resp[1]);
					r.set('ok', val);
				}catch(error){
					r.set('server_error', 'Invalid response');
				}
			}else{
				r.set('server_error', 'Invalid response');
			}
		}else{
			r.set(resp[0], resp.slice(1));
		}
		return r;
	}

    function float_resp(resp){
		r.type = 'val';
		if(resp[0] == 'ok'){
			if(resp.length == 2){
				try{
					val = parseFloat(resp[1]);
					r.set('ok', val);
				}catch(e){
					r.set('server_error', 'Invalid response');
				}
			}else{
				r.set('server_error', 'Invalid response');
			}
		}else{
			r.set(resp[0], resp.slice(1));
		}
		return r;
	}

    function str_resp(resp){
		r.type = 'val';
		if(resp[0] == 'ok'){
			if(resp.length == 2){
				r.set('ok', resp[1]);
			}else{
				r.set('server_error', 'Invalid response');
			}
		}else{
			r.set(resp[0], resp.slice(1));
		}
		return r;
	}

    function list_resp(resp){
		r.type = 'list';
		r.set(resp[0], resp.slice(1));
		return r;
	}

    function str_map_resp(resp){
		r.type = 'map';
		if(resp[0] == 'ok'){
			if(resp.length % 2 == 1){
				data = {'index': [], 'items':{}};
				for(i=1; i<resp.length; i+=2){
					k = resp[i];
					v = resp[i + 1];
					data['index'].push(k);
					data['items'][k] = v;
				}
				r.set('ok', data);
			}else{
				r.set('server_error', 'Invalid response');
			}
		}else{
			r.set(resp[0], r.shift());
		}
		return r;
	}

    function int_map_resp(resp){
		r.type = 'map';
		if(resp[0] == 'ok'){
			if(resp.length % 2 == 1){
				data = {'index':[], 'items':{}};
				for(i=1; i<resp.length; i+=2){
					k = resp[i];
					v = resp[i + 1];
					try{
						v = parseInt(v);
					}catch(err){
						v = -1;
					}
					data['index'].push(k);
					data['items'][k] = v;
				}
				r.set('ok', data);
			}else{
				r.set('server_error', 'Invalid response');
			}
		}else{
			r.set(resp[0], r.shift());
		}
		return r;
	}

    
    ///////////////////////////////////////////

    if(["ping", "set", "del", "qset", "zset", "qset", "hset", "qpush", "qpush_front", "qpush_back", "zdel", "hdel",
        "multi_set", "multi_hset", "multi_hdel", "multi_zset", "multi_zdel"
    ].includes(cmd)){
        if(resp.length > 1){
            return int_resp(resp)
        }else{
            return new SSDB_Response(resp[0], null)
        }
    }

    if(["version", "substr", "get", "getset", "hget", "qfront", "qback", "qget"].includes(cmd)){
        return str_resp(resp)
    }

    if(["qpop", "qpop_front", "qpop_back"].includes(cmd)){
        let size = 1
        try {
            size = parseInt(params[2])
        } catch (error) {
            
        }

        if (size==1)
            return str_resp(resp)
        else
            return list_resp(resp)
    }

    if(["dbsize", "getbit", "setbit", "countbit", "bitcount", "strlen", "ttl", "expire", "setnx", "incr",
        "decr", "zincr", "zdecr", "hincr", "hdecr", "hsize", "zsize", "qsize", "zget", "zrank", "zrrank",
        "zsum", "zcount", "zremrangebyrank", "zremrangebyscore", "hclear", "zclear", "qclear", "qpush",
        "qpush_front", "qpush_back", "qtrim_front", "qtrim_back"
    ].includes(cmd)){
        return int_resp(resp)
    }

    if(["zavg"].includes(cmd)){
        return float_resp(resp)
    }

    if(["keys", "rkeys", "zkeys", "zrkeys", "hkeys", 
        "hrkeys", "list", "hlist", "hrlist", "zlist",
        "zrlist"].includes(cmd)){
        return list_resp(resp)
    }

    if(["scan", "rscan", "hgetall", "hscan", "hrscan"].includes(cmd)){
        return str_map_resp(resp)
    }

    if(["zscan", "zrscan", "zrange", "zrrange", "zpop_front", "zpop_back"].includes(cmd)){
        return int_map_resp(resp)
    }

    if(["auth", "exists", "hexists", "zexists"].includes(cmd)){
        return int_resp(resp)
    }

    if(["multi_exists", "multi_hexists", "multi_zexists"].includes(cmd)){
        return int_map_resp(resp)
    }

    if(["multi_get", "multi_hget"].includes(cmd)){
        return str_map_resp(resp)
    }

    if(["multi_hsize", "multi_zsize", "multi_zget"].includes(cmd)){
        return int_map_resp(resp)
    }

    // default
	return list_resp(resp)

}

function printResult(cmd, resp, time_consume){

    function reprData(s){
        return `${s}`
    }
    //console.log(resp)
    if (!resp.ok()) {
        if (resp.not_found()) {
            console.error('not_found');
        } else {
            let s = resp.code;
            if (resp.message) {
                s += ': ' + String(resp.message);
            }
            console.error(String(s));
        }
        console.error(`(${time_consume.toFixed(3)} sec)`);
    } else {
        let skip = false;
    
        switch (cmd) {
            case 'ping':
            case 'qset':
            case 'compact':
            case 'auth':
            case 'set':
            case 'setx':
            case 'zset':
            case 'hset':
            case 'del':
            case 'zdel':
            case 'add_allow_ip':
            case 'del_allow_ip':
            case 'add_deny_ip':
            case 'del_deny_ip':
                skip = true;
                console.log(String(resp.code));
                break;
    
            case 'info':
                skip = true;
                let is_val = false;
                for (let i = 1; i < resp.data.length; i++) {
                    let s = resp.data[i];
                    if (is_val) {
                        s = '\t' + s.replace(/\n/g, '\n\t');
                    }
                    console.log(s);
                    is_val = !is_val;
                }
                console.error(`${resp.data.length} result(s) (${time_consume.toFixed(3)} sec)`);
                break;
        }
    
        if (skip) {
            console.error(`(${time_consume.toFixed(3)} sec)`);
        } else {
            switch (resp.type) {
                case 'none':
                    console.log(reprData(resp.data));
                    break;
    
                case 'val':
                    if (resp.code === 'ok') {
                        console.log(reprData(resp.data));
                    } else {
                        if (resp.data) {
                            console.log(reprData(resp.code), reprData(resp.data));
                        } else {
                            console.log(reprData(resp.code));
                        }
                    }
                    break;
    
                case 'list':
                    console.error('  key'.padStart(15));
                    console.error('-'.repeat(17));
                    resp.data.forEach(k => {
                        console.log('  ' + reprData(k).padStart(15));
                    });
                    console.error(`${resp.data.length} result(s) (${time_consume.toFixed(3)} sec)`);
                    break;
    
                case 'map':
                    console.error('key'.padEnd(15) + 'value');
                    console.error('-'.repeat(25));
                    resp.data['index'].forEach(k => {
                        let v = resp.data['items'][k];
                        console.log(`  ${reprData(k).padEnd(15)}: ${reprData(v)}`);
                    });
                    console.error(`${resp.data['index'].length} result(s) (${time_consume.toFixed(3)} sec)`);
                    break;
            }
            console.error(`(${time_consume.toFixed(3)} sec)`);
        }
    }
}

(async () => {
    let hostPort = "127.0.0.1:8888"
    if(process.argv.length > 2){
        hostPort = process.argv[2]
    }
    const [host, port] = hostPort.split(":")
    const ssdb = new SSDBClient([hostPort]);
    
    await ssdb.connect();
    try {

        do{
            const inputStr = await prompt(`ssdb ${host}:${port}> `)
            if(inputStr == "q")
                break;
            try {
                const splitted = inputStr.split(" ")
                const cmd = splitted[0].toLocaleLowerCase()
                const start_ts = Date.now()
                let ssdbResp = await ssdb.raw_request([...splitted])
                const end_ts = Date.now()
                const parsed = parseResponse(cmd, ssdbResp)
                printResult(cmd, parsed, (end_ts - start_ts) / 1000)
            } catch (error) {
                console.log(error)
            }
        }while(true)

    } finally {
        console.log("bye.")
        ssdb.close()
    }
    process.exit(0)
}
)()
