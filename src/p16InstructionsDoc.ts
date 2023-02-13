export const p16InstructionsDoc: { [key: string]: string } = {
    "add": "ADD Rd, Rn, <operand2>\nRd := Rn + operand2\nAffected Flags: N Z C V",
    "adc": "ADC Rd, Rn, Rm\nRd := Rn + Rm + Carry\nAffected Flags: N Z C V",
    "sub": "SUB Rd, Rn, <operand2>\nRd := Rn - operand2\nAffected Flags: N Z C V",
    "sbc": "SBC Rd, Rn, Rm\nRd := Rn - Rm - Carry\nAffected Flags: N Z C V",

    "and": "AND Rd, Rn, Rm\nRd := Rn AND Rm\nAffected Flags: N Z",
    "orr": "ORR Rd, Rn, Rm\nRd := Rn OR Rm\nAffected Flags: N Z",
    "eor": "EOR Rd, Rn, Rm\nRd := Rn EOR Rm\nAffected Flags: N Z",

    "lsl": "LSL Rd, Rn, #<immed_4>\nRd[15:immed_4] := Rn[15-immed_4:0];\nRd[immed_4-1:0] := 0\nAffected Flags: N Z C",
    "lsr": "LSR Rd, Rn, #<immed_4>\nRd[15-immed_4:0] := Rn[15:immed_4];\nRd[15:15-immed_4+1] := 0\nAffected Flags: N Z C",
    "asr": "ASR Rd, Rn, #<immed_4>\nRd[15-immed_4:0] := Rn[15:immed_4];\nRd[15:15-immed_4+1] := Rn[15]\nAffected Flags: N Z C",
    "ror": "ROR Rd, Rn, #<immed_4>\nRd[15-immed_4:0] := Rn[15:immed_4];\nRd[15:15-immed_4+1] := Rn[15:15-immed_4-1:0]\nAffected Flags: N Z C",
    "rrx": "RRX Rd, Rn\nRd[14:0] := Rn[15:1]; Rd[15] := Carry; Carry := Rn[0]\nAffected Flags: N Z C",

    "cmp": "CMP Rn, Rm\nDoes `Rn - Rm` and updates CPSR flags\nAffected Flags: N Z C V",

    "mov": "MOV Rd, <operand2L>\nRd := operand2L\nAffected Flags: None",
    "mvn": "MVN Rd, <operand2L>\nRd := 0xFFFF EOR Rm\nAffected Flags: N Z",
    "movt": "MOVT Rd, Rm\nRd[15:8] := immed_8\nAffected Flags: None",
    "movs": "MOVS PC, LR\nPC := LR; CPSR := SPSR\nAffected Flags: N Z C V",
    "msr": "MSR PSR, Rm\nPSR := Rm (bits 0 a 5)\nAffected Flags: None",
    "mrs": "MRS Rd, PSR\nRd := PSR\nAffected Flags: None",

    "ldr": "LDR Rd, <a_mode1>\nRd := [address]\nAffected Flags: None",
    "ldrb": "LDRB Rd, <a_mode3>\nRd[7:0] := [address]; Rd[15:8] := 0\nAffected Flags: None",
    "str": "STR Rd, <a_mode2>\n[address] := Rd\nAffected Flags: None",
    "strb": "STRB Rd, <a_mode3>\n[address] := Rd[7:0]\nAffected Flags: None",

    "push": "PUSH Rm\nSP := SP - 2; [SP] := Rm\nAffected Flags: None",
    "pop": "POP Rd\nRd := [SP]; SP := SP + 2\nAffected Flags: None",

    "b": "B label\nR15 := label\nAffected Flags: None",
    "bl": "BL label\nR14 := R15 + 2; R15 := label\nAffected Flags: None",
    "bzs": "BZS label\nBranch if flag Z is 1\nAffected Flags: None",
    "beq": "BEQ label\nBranch if equal\nAffected Flags: None",
    "bzc": "BZC label\nBranch if flag Z is 0\nAffected Flags: None",
    "bne": "BNE label\nBranch if not equal\nAffected Flags: None",
    "bcs": "BCS label\nBranch if flag C is 1\nAffected Flags: None",
    "bhs": "BHS label\nBranch if unsigned higher or same\nAffected Flags: None",
    "bcc": "BCC label\nBranch if flag C is 0\nAffected Flags: None",
    "blo": "BLO label\nBranch if unsigned lower\nAffected Flags: None",
    "blt": "BLT label\nBranch if signed less than\nAffected Flags: None",
    "bge": "BGE label\nBranch if signed greater than or equal\nAffected Flags: None",

    ".byte": "\`.byte [expr1 [, expr2, …]]\`\nReserves a sequence of bytes, each one initialized with the value of the respective expression. Without an argument it has no effect.",
    ".word": "\`.word [expr1 [, expr2, …]]\`\nReserves a sequence of words, each one initialized with the value of the respective expression. Without an argument it has no effect. A word is composed of two bytes, the one with the lowest weight being placed in the position with the lowest address, which must be an even address.",
    ".space": "\`.space size [, fill ]\`\nReserves a block of memory with the dimension in bytes indicated by the size parameter, each byte being initialized with the value of the fill expression. If the fill argument is omitted the block will be filled with zeros.",
    ".ascii": "\`.ascii \"string1\" [, \"string2\", …]\`\nReserves a portion of memory to hold the defined sequence of strings. The strings produced are composed only of the indicated characters, they do not contain a terminator.",
    ".asciz ": "\`.asciz \"string1\" [, \"string2\", …]\`\nReserves a portion of memory to hold the defined sequence of strings. The strings produced are composed of the indicated characters and terminated with a zero value (as in the C language).",
    ".align ": "\`.align [n]\`\nAdvances the location counter by a multiple of 2^n. The new counter value will have zero in the n least weighted bits. Omitting the argument is equivalent to .align 1.",
};