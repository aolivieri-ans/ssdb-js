function parseCommand(input) {
    const args = [];
    let currentArg = '';
    let inQuotes = false;
    let quoteChar = null;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '"' || char === "'") {
            if (inQuotes) {
                if (char === quoteChar) {
                    // End of quoted string
                    inQuotes = false;
                    quoteChar = null;
                    args.push(currentArg);  // Push even if empty
                    currentArg = '';
                } else {
                    currentArg += char;
                }
            } else {
                // Start of quoted string
                inQuotes = true;
                quoteChar = char;
                if (currentArg.length > 0) {
                    args.push(currentArg);
                    currentArg = '';
                }
            }
        } else if (char === ' ' && !inQuotes) {
            if (currentArg.length > 0) {
                args.push(currentArg);
                currentArg = '';
            }

            // Skip additional spaces if there are any
            while (input[i + 1] === ' ') {
                i++;
            }
        } else {
            currentArg += char;
        }
    }

    if (currentArg.length > 0 || inQuotes) {
        args.push(currentArg);
    }

    return args;
}

function printResult(cmd, resp, elapsed){

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
        console.error(`(${elapsed.toFixed(3)} sec)`);
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
                console.error(`${resp.data.length} result(s) (${elapsed.toFixed(3)} sec)`);
                break;
        }
    
        if (skip) {
            console.error(`(${elapsed.toFixed(3)} sec)`);
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
                    console.error(`${resp.data.length} result(s) (${elapsed.toFixed(3)} sec)`);
                    break;
    
                case 'map':
                    console.error('key'.padEnd(15) + 'value');
                    console.error('-'.repeat(25));
                    resp.data['index'].forEach(k => {
                        let v = resp.data['items'][k];
                        console.log(`  ${reprData(k).padEnd(15)}: ${reprData(v)}`);
                    });
                    console.error(`${resp.data['index'].length} result(s) (${elapsed.toFixed(3)} sec)`);
                    break;
            }
            console.error(`(${elapsed.toFixed(3)} sec)`);
        }
    }
}

module.exports = {
    parseCommand,
    printResult
}