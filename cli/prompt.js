const readline = require('readline');

class SSDBAutocompletePrompt {

    constructor(rl, promptText){
        this.rl = rl
        this.promptText = promptText
    }

    display = async () => {
        return new Promise((resolve) => {
            this.rl.question(this.promptText, (answer) => {
            resolve(answer);
            });
        });
          
    }

}

function buildAutocompleter(ssdbCli) {

    let allMethods = [];
    let obj = ssdbCli;

    // Extract ssdb cmds (i.e. all methods starting with 'a_')
    while (obj) {
        allMethods = allMethods.concat(
            Object.getOwnPropertyNames(obj)
                .filter(prop => typeof ssdbCli[prop] === 'function' && prop !== 'constructor')
        );
        obj = Object.getPrototypeOf(obj);
    }

    const ssdbCommands = allMethods
                        .filter(m => m.startsWith("a_"))

    let cmd2args = {}
    // Extract args
    for(const cmd of ssdbCommands){
        const method = ssdbCli[cmd]
        const methodStr = method.toString();
        const argsMatch = methodStr.match(/\(([^)]*)\)/);
        if(argsMatch && argsMatch[1] != undefined){
            cmd2args[cmd.slice(2)] = argsMatch[1]
                                        .split(",")
                                        .map(s => s.trim())
        }
    }

    cmd2args["quit"] = []
    const sortedCmds = Object.keys(cmd2args)
    sortedCmds.sort()
    let sortedCmd2Args = {}
    for(const cmd of sortedCmds){
        sortedCmd2Args[cmd] = cmd2args[cmd]
    }

    cmd2args = sortedCmd2Args;

    function autocomplete(input) {
        if (!input) {
            return Object.keys(cmd2args);
        }
        const split = input.split(" ")
        if(split.length > 1 && cmd2args[split[0]]){
            const cmd = split[0];
            const args = cmd2args[cmd]
            return [`${cmd} ${args.map(a => `[${a}]`).join(" ")}`]
        }else{
            return Object.keys(cmd2args).filter(option => option.startsWith(input));
        }
    }

    return (line) => {
        const hits = autocomplete(line);
        return [hits.length ? hits : [], line];
    }


}

function buildPrompt(ssdbCli, promptText){

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
        completer: buildAutocompleter(ssdbCli)
    });

    return new SSDBAutocompletePrompt(rl, promptText);

}

module.exports = {
    buildPrompt
}