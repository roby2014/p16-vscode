;; ----------------------------------------------------------------------------
    ;; CONSTANTS
	.equ	ENABLE_EXTINT, 0x10
	.equ	STACK_SIZE, 64
	.equ	OUTPORT_ADDRESS, 0xFF00
	.equ	VAR_INIT_VAL, 0


 
;; ----------------------------------------------------------------------------
    ;; startup section = PREPARE STACK AND CALL MAIN
	.section .startup
	b _start
	push r0
	push r1
	ldr	r0, var_addr_startup
	ldrb r1, [r0, #0]
	add	r1, r1, #1
	strb r1, [r0, #0]
	pop	r1
	pop	r0 
	movs pc, lr  
_start:
	ldr	sp, tos_addr
	ldr	pc, main_addr

tos_addr:
	.word tos
main_addr:
	.word main
var_addr_startup:
	.word var

 

;; ----------------------------------------------------------------------------
    ;; .text = CODE
	.text

; main()
main:
	mov	r0, #VAR_INIT_VAL
	ldr	r1, var_addr_main
	strb r0, [r1, #0]
	bl outport_write  
	mrs	r0, cpsr
	mov	r1, #ENABLE_EXTINT
	orr	r0, r0, r1
	msr	cpsr, r0
main_loop:
	ldr	r0, var_addr_main
	ldrb r0, [r0, #0]
	bl outport_write
	b main_loop

var_addr_main:
	.word	var

; void outport_write(uint16_t value)
; Writes [value] aKa r0 to OUTPUT PORT
outport_write:
	ldr	r1, outport_addr
	strb	r0, [r1, #0]
	mov	pc, lr

outport_addr:
	.word	OUTPORT_ADDRESS


;; ----------------------------------------------------------------------------
    ;; .data = INITIALIZED GLOBAL DATA
	.data

random_arr:
    .byte 0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02


;; ----------------------------------------------------------------------------
    ;; .bss = NON INITIALIZED GLOBAL DATA
    .section .bss

var:
	.space	1
	.align


;; ----------------------------------------------------------------------------
    ;; .section .stack = IMPLEMENT STACK
	.section .stack
	.space	STACK_SIZE
tos:
