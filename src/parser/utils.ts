const MAX_REG = 15;

/// parses register operand (Rd, Rn, Rm ...)
export function parse_reg_operand(rx: string, is_rn: boolean = false): [boolean, string] {
    let x = get_reg_number(rx);
    if (is_rn && x > 7) {
        return [false, `"Rn" should be R[0..7].`];
    }

    if (is_rn)
        if (rx == "sp" || rx == "pc" || rx == "lr" || rx == "spsr" || rx == "cpsr")
            return [false, `"Rn" can not be ${rx}.`];

    if (rx == "sp" || rx == "pc" || rx == "lr" || rx == "spsr" || rx == "cpsr")
        return [true, ``];


    if (x == NaN || !valid_reg_num(x) || x == -1) {
        return [false, `"${rx}" is not a valid register.`];
    }

    return [true, ``];
}

/// prints parsing error to console
export function print_error(err_msg: string, line: string, line_number: number) {
    console.log(`-------------------------------------------------------------`);
    console.log(line);
    console.log(`ERROR! Syntax error at line ${line_number}: ${err_msg}`);
}

/// returns [reg]ister's number, or -1 if invalid
/// e.g: r3 -> 3
export function get_reg_number(reg: String) {
    return reg[0] != 'r' || reg.length == 1 ? -1 : Number(reg.substring(1, reg.length));
}

/// returns true if [n] is a number
export function is_a_number(n: number) {
    return !Number.isNaN(n);
}

/// returns true if [n] is a valid reg number
export function valid_reg_num(n: number) {
    return n >= 0 && n <= MAX_REG;
}

/// returns true if line is a label (e.g label_name:)
export function is_label(line: string): boolean {
    return line.indexOf(":") == line.length - 1;
} 