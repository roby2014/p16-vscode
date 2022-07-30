import { parse_reg_operand, is_a_number } from "./utils";

// TODO: make these functions return a RANGE where the error is...

/// INSTR Rd, Rn, Rm
function parse_rd_rn_rm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rn', 'Rm']
    const usage = `( ${instr} Rd, Rn, Rm )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);;
    if (tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rn
    [success, err_msg] = parse_reg_operand(tmp[1], true);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rm
    [success, err_msg] = parse_reg_operand(tmp[2]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rd, Rn, Rm
/// INSTR Rd, Rn, #<immed_4>
function parse_rd_rn_rm_or_immed4(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rn', 'Rm | #<immed_4>']
    const usage = `( ${instr} Rd, Rn, Rm | #<immed_4> )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rn
    [success, err_msg] = parse_reg_operand(tmp[1], true);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rm
    [success, err_msg] = parse_reg_operand(tmp[2]);
    if (!success) {
        // not Rm, maybe <immed_4>?
        let rm = tmp[2];
        if (rm[0] == '#') rm = rm.substring(1, rm.length) // remove '#'

        let immed_4 = Number(rm);
        if (is_a_number(immed_4)) {
            if (immed_4 > 0xF) {
                return [false, `Expression's value = ${immed_4} (0x${immed_4.toString(16)}) not encodable in 4 bit.`];
            }
            return [true, ``];
        }
        return [false, `${usage} \n\t "${rm}" is not an "#<immed_4>" or "Rm".`];
    }

    return [true, ``];
}

/// INSTR Rd, Rn, #<immed_4>
function parse_rd_rn_immed4(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rn', '#<immed_4>']
    const usage = `( ${instr} Rd, Rn, #<immed_4> )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);;
    if (tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rn
    [success, err_msg] = parse_reg_operand(tmp[1], true);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // <immed_4>
    let rm = tmp[2].substring(tmp[2][0] == '#' ? 1 : 0, tmp[2].length) // remove '#' if it exists
    let immed_4 = Number(rm);
    if (is_a_number(immed_4)) {
        if (immed_4 > 0xF) {
            return [false, `Expression's value = ${immed_4} (0x${immed_4.toString(16)}) not encodable in 4 bit.`];
        }
        return [true, ``];
    }

    return [false, `${usage} \n\t "${tmp[2]}" is not an "#<immed_4>".`];
}

/// INSTR label
function parse_label(label: string, instr: string): [boolean, string] {
    // TODO: check if instr exists in symbol/label table and if in range
    return [true, ``];
}

/// INSTR Rn, Rm
function parse_rn_rm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rn', 'Rm']
    const usage = `( ${instr} Rn, Rm )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rn
    let [success, err_msg] = parse_reg_operand(tmp[0], true);
    if (!success) {
        return [false, `( ${instr} Rn, Rm ) \n ${err_msg}`];
    }

    // Rm
    [success, err_msg] = parse_reg_operand(tmp[1]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rd, Rm
/// INSTR Rd, #<immed_8>
function parse_rd_rm_or_immed8(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rm | #<immed_8>']
    const usage = `( ${instr} Rd, Rm | #<immed_8> )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);;
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rm
    [success, err_msg] = parse_reg_operand(tmp[1]);
    if (!success) {
        // not Rm, maybe <immed_8>?
        let rm = tmp[1];
        if (rm[0] == '#') rm = rm.substring(1, rm.length); // remove '#'

        let immed_8 = Number(rm);
        if (is_a_number(immed_8)) {
            if (immed_8 > 0xFF) {
                return [false, `Expression's value = ${immed_8} (0x${immed_8.toString(16)}) not encodable in 8 bit.`];
            }
            return [true, ``];
        }

        // TODO: mov can load via label / indirect jumps, so before we return error
        // we should also check symbol/label table

        return [false, `${usage} \n\t "${rm}" is not an "#<immed_8>" or "Rm".`];
    }

    return [true, ``];
}

/// INSTR Rd, #<immed_8>
function parse_rd_immed8(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', '<immed_8>']
    const usage = `( ${instr} Rd, #<immed_8> )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);;
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // <immed_8>
    let rm = tmp[1].substring(tmp[2][0] == '#' ? 1 : 0, tmp[1].length) // remove '#' if it exists
    let immed_8 = Number(rm);
    if (is_a_number(immed_8)) {
        if (immed_8 > 0xFF) {
            return [false, `Expression's value = ${immed_8} (0x${immed_8.toString(16)}) not encodable in 8 bit.`];
        }
        return [true, ``];
    }

    return [true, ``];
}

/// INSTR Rd, Rm
function parse_rd_rm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rm']
    const usage = `( ${instr} Rd, Rm )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rm
    [success, err_msg] = parse_reg_operand(tmp[2]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rd
function parse_rd(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd']
    const usage = `( ${instr} Rd )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 1) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rm
function parse_rm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rm']
    const usage = `( ${instr} Rm )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 1) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rm
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rd, Rn
function parse_rd_rn(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'Rn']
    const usage = `( ${instr} Rd, Rn )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // Rn
    [success, err_msg] = parse_reg_operand(tmp[1], true);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

/// INSTR Rd, labelS
/// INSTR Rd, [Rn, #<immed_4>]
/// INSTR Rd, [Rn, Rm]
function parse_rd_labelS_or_rnimmed4_or_rnrm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'labelS | [Rn, #<immed_4>] | [Rn, Rm]']
    const usage = `( ${instr} Rd, labelS | [Rn, #<immed_4>] | [Rn, Rm] )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2 && tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // TODO: parse 'labelS | [Rn, #<immed_4>] | [Rn, Rm]'
    return [true, ``];
}

/// INSTR Rd, [Rn, #<immed_3>]
/// INSTR Rd, [Rn, Rm]
function parse_rd_rnimmed3_or_rnrm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', '[Rn, #<immed_3>] | [Rn, Rm]']
    const usage = `( ${instr} Rd, labelS | [Rn, #<immed_3>] | [Rn, Rm] )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2 && tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // TODO: parse '[Rn, #<immed_3>] | [Rn, Rm]'
    return [true, ``];
}

/// INSTR Rd, [Rn, #<immed_4>]
/// INSTR Rd, [Rn, Rm]
function parse_rd_rnimmed4_or_rnrm(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', '[Rn, #<immed_4>] | [Rn, Rm]']
    const usage = `( ${instr} Rd, [Rn, #<immed_4>] | [Rn, Rm] )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2 && tmp.length != 3) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // TODO: parse '[Rn, #<immed_4>] | [Rn, Rm]'
    return [true, ``];
}

/// INSTR pc, lr
function parse_pc_lr(operands: string, instr: string): [boolean, string] {
    // tmp = ['pc', 'lr']
    const usage = `( ${instr} pc, lr )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2 || tmp[0] != "pc" || tmp[1] != "lr") {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    return [true, ``];
}

/// INSTR Rd, CPSR
/// INSTR Rd, SPSR
function parse_rd_cpsr_or_spsr(operands: string, instr: string): [boolean, string] {
    // tmp = ['Rd', 'CPSR | SPSR']
    const usage = `( ${instr} Rd, CPSR | SPSR )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[0]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    // CPSR | SPSR
    if (tmp[1].toLowerCase() != "cpsr" && tmp[1].toLowerCase() != "spsr") {
        return [false, `${usage} \n\t ${tmp[1]} should be "CPSR" or "SPSR".`];
    }

    return [true, ``];
}

/// INSTR CPSR, Rm
/// INSTR SPSR, Rm
function parse_cpsr_or_spsr_rm(operands: string, instr: string): [boolean, string] {
    // tmp = ['CPSR | SPSR', 'Rm']
    const usage = `( ${instr} CPSR | SPSR, Rm )`;
    let tmp = operands.split(",").map(value => value.replace(/\s/g, "")).filter(value => value.length > 1);
    if (tmp.length != 2) {
        return [false, `${usage} : Wrong usage of "${instr}" instruction.`];
    }

    // CPSR | SPSR
    if (tmp[0].toLowerCase() != "cpsr" && tmp[0].toLowerCase() != "spsr") {
        return [false, `${usage} \n\t ${tmp[0]} should be "CPSR" or "SPSR".`];
    }

    // Rd
    let [success, err_msg] = parse_reg_operand(tmp[1]);
    if (!success) {
        return [false, `${usage} \n\t ${err_msg}`];
    }

    return [true, ``];
}

export {
    parse_rd_rn_rm,
    parse_rd_rn_rm_or_immed4,
    parse_rd_rn_immed4,
    parse_label,
    parse_rn_rm,
    parse_rd_rm_or_immed8,
    parse_rd_immed8,
    parse_rd_rm,
    parse_rd,
    parse_rm,
    parse_rd_rn,
    parse_rd_labelS_or_rnimmed4_or_rnrm,
    parse_rd_rnimmed3_or_rnrm,
    parse_rd_rnimmed4_or_rnrm,
    parse_pc_lr,
    parse_rd_cpsr_or_spsr,
    parse_cpsr_or_spsr_rm
};
