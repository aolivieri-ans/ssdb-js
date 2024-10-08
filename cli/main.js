#!/usr/bin/env node

const { SSDBClient } = require("../index");
const { SSDB_Response } = require('./parser');
const { buildPrompt } = require('./prompt');
const { parseCommand, printResult, readStdin } = require('./util');
const { parseArgs } = require('node:util');

const options = {
    'host': {
      type: 'string',
      short: 'h',
      default: '127.0.0.1'
    },
    'port': {
      type: 'string',
      short: 'p',
      default: '8888',
    },
    'help': {
      type: 'string',
      type: 'boolean',
      default: false
    },
};

const {
    values: args,
    positionals
} = parseArgs({
    allowPositionals:true, 
    options
});

(async () => {
    // Main
    const [host, port] = [args.host, args.port]
    const ssdb = new SSDBClient([`${host}:${port}`]);

    await ssdb.connect();
    
    try {
        let cmd = ""
        if (!process.stdin.isTTY) {
            cmd = (await readStdin()).trim()
        }

        if(positionals.length > 0){
            cmd = positionals.join(" ")
        }

        if(cmd.length > 0){
            await executeCommand(ssdb, cmd)
        }else{
            await executePrompt(ssdb, host, port);
            console.log("bye.")
        }

    } finally {
        ssdb.close()
    }
    process.exit(0)
}
)()


async function executePrompt(ssdb, host, port) {

    const prompt = buildPrompt(ssdb, `ssdb ${host}:${port}> `);

    do {
        const inputStr = await prompt.display();
        if (!inputStr)
            continue;
        if (inputStr == "q" || inputStr == "quit")
            break;

        await executeCommand(ssdb, inputStr);
    } while (true);
}

async function executeCommand(ssdb, inputStr) {
    const splitted = parseCommand(inputStr);
    const cmd = splitted[0].toLocaleLowerCase();
    const start_ts = Date.now();
    try {
        let ssdbResp = await ssdb.raw_request([...splitted]);
        const end_ts = Date.now();
        const parsed = SSDB_Response.parseCmdResponse(cmd, ssdbResp);
        printResult(cmd, parsed, (end_ts - start_ts) / 1000);
    } catch (error) {
        if(error.code){
            // server error
            const end_ts = Date.now();
            printResult(cmd, new SSDB_Response(error.code, error.message), (end_ts - start_ts) / 1000)
        }else{
            console.error(error)
        }
    }
}

