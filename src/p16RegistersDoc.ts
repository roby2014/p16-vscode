function getRegisterDoc(input: string): string[] {
    const registerMap = {
        "Rd": "Any register (`R0` - `R15`)",
        "Rm": "Any register (`R0` - `R15`)",
        "Rn": "One of the low registers (`R0` - `R7`)",
        "PC": "Program counter",
        "R15": "Program counter",
        "LR": "Link register",
        "R14": "Link register",
        "SP": "Stack pointer",
        "PSR": "Can reference the Current Processor Status Register (`CPSR`) or the Saved Processor Status Register (`SPSR`)",

        "<operand2>": "`#<immed_4>` or `Rm`",
        "<operand2L>": "`#<immed_8>` or `Rm`",

        "#<immed_4>": "A constant encoded with 4-bits in the instruction using natural binary code",
        "#<immed_8>": "A constant encoded with 8-bits in the instruction using natural binary code",
        "immed_n": "A constant encoded with n-bits in the instruction using natural binary code",
        "offset_n": "A constant encoded with n-bits in the instruction using two's complement code",
        
        "<a_mode1>": "\n\
        | --------------------- | ----------------- | ----------------------------- |\n\
        | Indirect              | [Rn]              | [Rn, #0]                      |\n\
        | Constant indexed      | [Rn, #<immed_4>]  | address := Rn + immed_4[3:1]:0|\n\
        | Register indexed      | [Rn, Rm]          | address := Rn + Rm            |\n\
        | Relative              | labelS            | address := labelS             |\n",

        "<a_mode2>": "\n\
        | --------------------- | ----------------- | ----------------------------- |\n\
        | Indirect              | [Rn]              | [Rn, #0]                      |\n\
        | Constant indexed      | [Rn, #<immed_4>]  | address := Rn + immed_4[3:1]:0|\n\
        | Register indexed      | [Rn, Rm]          | address := Rn + Rm            |\n",

        "<a_mode3>": "\n\
        | --------------------- | ----------------- | ----------------------------- |\n\
        | Indirect              | [Rn]              | [Rn, #0]                      |\n\
        | Constant indexed      | [Rn, #<immed_3>]  | address := Rn + immed_3       |\n\
        | Register indexed      | [Rn, Rm]          | address := Rn + Rm            |\n",

        "<label>": "Must reference an address within +-1 KB of the instruction",
        "<labelS>": "Must reference an address within +128 B of the instruction"
    };

    const registers = input.split(",");
    return registers.map(register => `\`${register}\` : ` + registerMap[register] || `Unknown register: ${register}`);
}

export const p16RegistersDoc: { [key: string]: string[] } = {
    "add": getRegisterDoc("Rd,Rn,<operand2>"), // ADD Rd, Rn, <operand2>
    "adc": getRegisterDoc("Rd,Rn,Rm"), // ADC Rd, Rn, Rm
    "sub": getRegisterDoc("Rd,Rn,<operand2>"), // SUB Rd, Rn, <operand2>
    "sbc": getRegisterDoc("Rd,Rn,Rm"), // SBC Rd, Rn, Rm

    "and": getRegisterDoc("Rd,Rn,<operand2>"), // AND Rd, Rn, <operand2>
    "eor": getRegisterDoc("Rd,Rn,<operand2>"), // EOR Rd, Rn, <operand2>
    "orr": getRegisterDoc("Rd,Rn,<operand2>"), // ORR Rd, Rn, <operand2>

    "lsl": getRegisterDoc("Rn,Rn,#<immed_4>"), // LSL Rd, Rn, #<immed_4>
    "lsr": getRegisterDoc("Rn,Rn,#<immed_4>"), // LSR Rd, Rn, #<immed_4>
    "asr": getRegisterDoc("Rn,Rn,#<immed_4>"), // ASR Rd, Rn, #<immed_4>
    "ror": getRegisterDoc("Rn,Rn,#<immed_4>"), // ROR Rd, Rn, #<immed_4>
    "rrx": getRegisterDoc("Rn,Rn"), // RRX Rd, Rn

    "cmp": getRegisterDoc("Rn,Rm"), // CMP Rn, Rm

    "mov": getRegisterDoc("Rd,<operand2L>"), // MOV Rd, <operand2L>
    "mvn": getRegisterDoc("Rd,<operand2L>"), // MVN Rd, <operand2L>
    "movt": getRegisterDoc("Rd,Rm"), // MOVT Rd, Rm
    "movs": getRegisterDoc("PC,LR"), // MOVS PC, LR
    "msr": getRegisterDoc("PSR,Rm"), // MSR PSR, Rm
    "mrs": getRegisterDoc("Rd,PSR"), // MRS Rd, PSR

    "ldr": getRegisterDoc("Rd,<a_mode1>"), // LDR Rd, <a_mode1>
    "ldrb": getRegisterDoc("Rd,<a_mode3>"), // LDRB Rd, <a_mode3>
    "str": getRegisterDoc("Rd,<a_mode2>"), // STR Rd, <a_mode2>
    "strb": getRegisterDoc("Rd,<a_mode3>"), // STRB Rd, <a_mode3>

    "push": getRegisterDoc("Rm"), // PUSH Rm
    "pop": getRegisterDoc("Rd"), // POP Rm

    "b": getRegisterDoc("<label>"), // B <label>
    "bl": getRegisterDoc("<label>"), // BL <label>
    "bzs": getRegisterDoc("<label>"), // BZS <label>
    "beq": getRegisterDoc("<label>"), // BEQ <label>
    "bzc": getRegisterDoc("<label>"), // BZC <label>
    "bne": getRegisterDoc("<label>"), // BNE <label>
    "bcs": getRegisterDoc("<label>"), // BCS <label>
    "bhs": getRegisterDoc("<label>"), // BHS <label>
    "bcc": getRegisterDoc("<label>"), // BCC <label>
    "blo": getRegisterDoc("<label>"), // BLO <label>
    "blt": getRegisterDoc("<label>"), // BLT <label>
    "bge": getRegisterDoc("<label>"), // BGE <label>
};