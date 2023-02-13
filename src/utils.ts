import { extname } from "path";

/// returns true if we on a P16 file
export function isP16File(filePath: string): boolean {
    const fileExt = extname(filePath);
    return [".S", ".s"].includes(fileExt) && !filePath.includes(".git");;
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