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

module.exports = {
    parseCommand
}