export const p16SectionsDoc: { [key: string]: string } = {
    // TODO: better documentation on these
    ".section": ".text\nDefines a section",
    ".text": ".text\ntext section",
    ".rodata": ".rodata\nrodata section",
    ".data": ".data\ndata section",
    ".bss": ".bss\nbss section",
    ".stack": ".stack\nstack section",
    ".equ": "`.equ name, value`\nDefines a constant",

    ".byte": "\`.byte [expr1 [, expr2, …]]\`\nReserves a sequence of bytes, each one initialized with the value of the respective expression. Without an argument it has no effect.",
    ".word": "\`.word [expr1 [, expr2, …]]\`\nReserves a sequence of words, each one initialized with the value of the respective expression. Without an argument it has no effect. A word is composed of two bytes, the one with the lowest weight being placed in the position with the lowest address, which must be an even address.",
    ".space": "\`.space size [, fill ]\`\nReserves a block of memory with the dimension in bytes indicated by the size parameter, each byte being initialized with the value of the fill expression. If the fill argument is omitted the block will be filled with zeros.",
    ".ascii": "\`.ascii \"string1\" [, \"string2\", …]\`\nReserves a portion of memory to hold the defined sequence of strings. The strings produced are composed only of the indicated characters, they do not contain a terminator.",
    ".asciz ": "\`.asciz \"string1\" [, \"string2\", …]\`\nReserves a portion of memory to hold the defined sequence of strings. The strings produced are composed of the indicated characters and terminated with a zero value (as in the C language).",
    ".align ": "\`.align [n]\`\nAdvances the location counter by a multiple of 2^n. The new counter value will have zero in the n least weighted bits. Omitting the argument is equivalent to .align 1."
}

/// returns true if [instr] is a section symbol
export function isP16Section(instr): boolean {
    return Object.keys(p16SectionsDoc).includes(`.${instr}`);
}