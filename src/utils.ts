import { extname } from "path";
import { workspace } from "vscode";
import { platform } from 'os';

/// returns true if we on a P16 file
export function isP16File(filePath: string): boolean {
    const fileExt = extname(filePath);
    return [".S", ".s"].includes(fileExt) && !filePath.includes(".git");;
}

/// Returns P16's executable command.
export function getP16Executable(): string {
    /// default executables in case "p16.executablePath" is not set
    const defaultExecutable = {
        win: "pas16as.exe",
        linux: "pas16as"
    };

    const executable = workspace.getConfiguration("p16").get<string>("executablePath") ||
        (platform() === 'win32' ? defaultExecutable.win : defaultExecutable.linux);
    return executable;
}

/// returns true if line has a section identifier
export function isSectionOrOther(line: string): boolean {
    return line.indexOf(".equ") != -1
        || line.indexOf(".space") != -1
        || line.indexOf(".section") != -1
        || line.indexOf(".bss") != -1
        || line.indexOf(".data") != -1
        || line.indexOf(".text") != -1
        || line.indexOf(".align") != -1
        || line.indexOf(".word") != -1
        || line.indexOf(".byte") != -1
        || line.indexOf(".asciz") != -1
        || line.indexOf(".ascii") != -1
        || line.indexOf(".stack") != -1;
}