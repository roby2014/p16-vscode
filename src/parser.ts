/// parses p16 compiler error output and returns an array of objects 
/// containing the errors found information
/// line, column, columnEnd, message, instruction, isError, isWarning
export function parseErrorOutput(output: string) {
    const lines = output.split("\n");
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.indexOf("ERROR!") == -1 && line.indexOf("WARNING!") == -1)
            continue;

        const errorLine = lines[i - 2];
        const errorTracker = lines[i - 1];
        const lineNumberMatch = errorLine.match(/\((\d+)\)/);
        if (!lineNumberMatch)
            continue;

        const lineNumber = parseInt(lineNumberMatch[1], 10);
        const instruction = errorLine.substring(errorLine.indexOf(":") + 1);

        // TODO: fix range (column + columnEnd) depending on ^ error tracker
        // so the error diagnostic highlights where the P16 compiler did

        errors.push({
            line: lineNumber - 1,
            column: instruction.indexOf(instruction.trim()) - 1,
            columnEnd: line.length,
            message: line.trim(),
            instruction: instruction.trim(),
            isError: line.indexOf("ERROR!") != -1,
            isWarning: line.indexOf("WARNING!") != -1
        });
    }

    return errors;
}