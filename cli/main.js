#!/usr/bin/env node

const { SSDBClient } = require("../index");
const { SSDB_Response } = require('./parser');
const { buildPrompt } = require('./prompt');
const { parseCommand, printResult } = require('./util');


(async () => {
    // Main
    let hostPort = "127.0.0.1:8888"
    if(process.argv.length > 2){
        hostPort = process.argv[2]
    }
    const [host, port] = hostPort.split(":")
    const ssdb = new SSDBClient([hostPort]);

    await ssdb.connect();

    try {

        const prompt = buildPrompt(ssdb, `ssdb ${host}:${port}> `)
          
        do{
            const inputStr = await prompt.display();
            if(!inputStr)
                continue
            if(inputStr == "q" || inputStr == "quit")
                break;
            try {
                const splitted = parseCommand(inputStr)
                const cmd = splitted[0].toLocaleLowerCase()
                const start_ts = Date.now()
                let ssdbResp = await ssdb.raw_request([...splitted])
                const end_ts = Date.now()
                const parsed = SSDB_Response.parseCmdResponse(cmd, ssdbResp)
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
