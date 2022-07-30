import * as parser from "./parse_XXX";

const ISA_INSTRUCTIONS = [
    "ldr", "str", "ldrb", "strb", "push", "pop", "add", "sub", "adc", "sbc", "and", "orr",
    "eor", "not", "cmp", "mov", "mvn", "movt", "movs", "asr", "lsl", "lsr", "ror", "rrx",
    "mrs", "msr", "b", "bl", "beq", "bzs", "bne", "bzc", "blo", "bcs", "bhs", "bcc", "bge", "blt"
]

// function/branch table
const fn_table = new Map([
    ['adc', parser.parse_rd_rn_rm],
    ['add', parser.parse_rd_rn_rm_or_immed4],
    ['and', parser.parse_rd_rn_rm],
    ['asr', parser.parse_rd_rn_immed4],
    ['b', parser.parse_label],
    ['bcc', parser.parse_label],
    ['bhs', parser.parse_label],
    ['bcs', parser.parse_label],
    ['blo', parser.parse_label],
    ['bge', parser.parse_label],
    ['bl', parser.parse_label],
    ['blt', parser.parse_label],
    ['bzc', parser.parse_label],
    ['bne', parser.parse_label],
    ['bzs', parser.parse_label],
    ['beq', parser.parse_label],
    ['cmp', parser.parse_rn_rm],
    ['eor', parser.parse_rd_rn_rm],
    ['ldr', parser.parse_rd_labelS_or_rnimmed4_or_rnrm],
    ['ldrb', parser.parse_rd_rnimmed3_or_rnrm],
    ['lsl', parser.parse_rd_rn_immed4],
    ['lsr', parser.parse_rd_rn_immed4],
    ['mov', parser.parse_rd_rm_or_immed8],
    ['movs', parser.parse_pc_lr],
    ['movt', parser.parse_rd_immed8],
    ['mrs', parser.parse_rd_cpsr_or_spsr],
    ['msr', parser.parse_cpsr_or_spsr_rm],
    ['mvn', parser.parse_rd_rm],
    ['orr', parser.parse_rd_rn_rm],
    ['pop', parser.parse_rd],
    ['push', parser.parse_rm],
    ['ror', parser.parse_rd_rn_immed4],
    ['rrx', parser.parse_rd_rn],
    ['sub', parser.parse_rd_rn_rm_or_immed4],
    ['sbc', parser.parse_rd_rn_rm],
    ['str', parser.parse_rd_rnimmed4_or_rnrm],
    ['strb', parser.parse_rd_rnimmed3_or_rnrm],
]);

// TODO: symbol table with constants/indirect jumps, so immed_8 etc dont throw errors when we are using a identifier name
// The table should be refreshed on every edit, which is not perfect for performance, but usable.

/// parses [line] and returns success, error_msg if any
export function parse_line(line: string, line_number: number): [boolean, string] {
    if (line.length <= 0)
        return;

    line = line.trimStart().replace("\t", " "); // remove initial tab
    const c = line.indexOf(" ");
    const instruction = line.substring(0, c);
    if (ISA_INSTRUCTIONS.find(x => x == instruction) == undefined || !fn_table.has(instruction)) {
        if (instruction.length == 0)
            return [false, `Error parsing this line.`];
        else
            return [false, `Instruction "${instruction}" does not exist.`];
    }

    let operands_end = line.length;
    const comment = line.indexOf(";"); // ignore rest of line if comment
    if (comment != -1) {
        operands_end = comment;
    }

    const operands = line.substring(c + 1, operands_end);
    const [success, err_msg] = fn_table.get(instruction)(operands, instruction);
    return [success, err_msg];
}