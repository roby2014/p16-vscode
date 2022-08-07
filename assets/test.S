    .equ STACK_SIZEs, 64
  
    .equ STATE_STANDBY, 0   ; new game
    .equ STATE_PLAYING, 1   ; playing
    .equ STATE_OVER, 2      ; game over

    ; TIME
    .equ AFTER_POINTS_NOTIFY, 0x05       ; 50ms * 5     = 250ms
    .equ AFTER_POINTS_DISMISS, 0xF       ; 50ms * 15    = 750ms
    .equ AFTER_ONE_SEC, 0x14             ; 50ms * 20    = 1s
    .equ DELAY_GAME_OVER, 0x64           ; 50ms * 100   = approx 5s

    .equ	LEVEL_ONE_TIME, 0x10          ; 50ms * 16 = 800 ms
    .equ	LEVEL_TWO_TIME, 0x08          ; 50ms * 8  = 400 ms 
    .equ	LEVEL_THREE_TIME, 0x04        ; 50ms * 4  = 200 ms

    .equ SYSCLK_FREQ, 0x31                ; 1 KHz = 49 ms = 0x31

    .equ GOING_BACKWARDS, 0 ; backwards = 0, forwards = 1
    .equ WALL_POS, 6
    .equ PLAYER_POS, 0

    .equ INPORT_ADDRESS, 0xff00
	.equ OUTPORT_ADDRESS, 0xff00
    .equ OUTPORT_INIT_VAL, 0
    .equ CPSR_BIT_I, 0b010000

    ; PTC
	.equ	PTC_ADDRESS,  0xFF40          ; Endereco do circuito pTC
	.equ	PTC_TCR, 0                    ; Deslocamento do registo TCR do pTC
	.equ	PTC_TMR, 2                    ; Deslocamento do registo TMR do pTC
	.equ	PTC_TC, 4                     ; Deslocamento do registo TC do pTC
	.equ	PTC_TIR, 6                    ; Deslocamento do registo TIR do pTC
	.equ	PTC_CMD_START, 0              ; Comando para iniciar a contagem no pTC
	.equ	PTC_CMD_STOP, 1               ; Comando para parar a contagem no pTC

;; ----------------------------------------------------------------------------
    ;; startup section = PREPARE STACK AND CALL MAIN
    .section startup
    b _start
    ldr	pc, isr_addr
_start:
    ldr	sp, stack_addr
	ldr	pc, main_addr

stack_addr:
    .word stack
main_addr:
    .word main
isr_addr:
	.word isr


;; ----------------------------------------------------------------------------
    ;; .text = CODE
    .text

; main()
; State machine 
main:
    push lr
    ; setup outport
    mov	r0, #OUTPORT_INIT_VAL
	bl	outport_init
	; setup ptc
    mov	r0, #SYSCLK_FREQ
	bl	ptc_init
    ; setup cpsr
	mrs	r0, cpsr
	mov	r1, #CPSR_BIT_I
	orr	r0, r0, r1
	msr	cpsr, r0
    ; sm_state = 0
    ldr r0, sm_state_addr
    mov r1, #0
    strb r1, [r0, #0]

switch_state:
    ldr r0, sm_state_addr
    ldrb r0, [r0, #0]       ; r0 = sm_state
case_state_standby:
    mov r1, #STATE_STANDBY
    cmp r0, r1
    bne case_state_playing
    bl new_game
    b case_state_end

case_state_playing:
    mov r1, #STATE_PLAYING
    cmp r0, r1
    bne case_state_game_over
    bl playing
    b case_state_end

case_state_game_over:
    mov r1, #STATE_OVER
    cmp r0, r1
    bne case_state_default
    bl game_over
    b case_state_end

case_state_default:
    mov r0, #STATE_STANDBY
case_state_end:
    b switch_state

    pop pc

sm_state_addr:
    .word sm_state


; void new_game()
; wait for new game state
new_game:
    push lr
    bl game_setup
new_game_while:
    bl racket_test_stroke
    mov r1, #1
    cmp r0, r1
    bne new_game_while  ; if (!stroke_valid) continue
new_game_exit:
    bl level_get_value
    ; sm_state = playing
    mov r1, #STATE_PLAYING
    ldr r0, sm_state_addr___
    strb r1, [r0, #0]
    bl move_ball
    pop pc

sm_state_addr___:
    .word sm_state


; bool stroke_get_value()
; Returns 1 if a stroke was sent, 0 otherwise
; stroke is invoked from an INPUT PORT (ascending transition)
racket_test_stroke:
    push lr
    mov r2, #0x1 ; mask I0
    ; 1st instance
    bl inport_read
    and r3, r0, r2      ; r3 = 1st instance
    ; 2nd instance
    bl inport_read
    and r0, r0, r2      ; r0 = 2nd instance
    cmp r3, r0          ; if (r3 < r1) stroke = valid
    blt stroke_return_one
    mov r0, #0          ; stroke = invalid
    b stroke_get_value_exit
stroke_return_one:
    mov r0, #1          ; stroke = valid
stroke_get_value_exit:
    pop pc


; void level_get_value()
; Gets the level and gets the level time depending on the level.
level_get_value:
    push lr
    bl inport_read
    mov r1, #0xC0               ; mask I7 I6
    and r0, r0, r1              ; r0 = I7 I6
    ldr r1, level_addr          ; r1 = &level
	strb r0, [r1, #0]           ; level = r0
    ldr r2, level_time_addr     ; r2 = &level_time
switch_level:
level_case_slow:                ; case 0 
    mov r1, #0
    cmp r0, r1 
    bne level_case_normal
    mov r3, #LEVEL_ONE_TIME
    str r3, [r2, #0]            ; level_time = LEVEL_ONE_TIME
    b level_case_end

level_case_normal:              ; case 0x40
    mov r1, #0x40
    cmp r0, r1
    bne level_case_fast
    mov r3, #LEVEL_TWO_TIME
    str r3, [r2, #0]            ; level_time = LEVEL_TWO_TIME
    b level_case_end

level_case_fast:
    mov r1, #0x80               ; case 0x80
    cmp r0, r1
    bne level_case_mixed
    mov r3, #LEVEL_THREE_TIME
    str r3, [r2, #0]            ; level_time = LEVEL_THREE_TIME
    b level_case_end

level_case_mixed:
    mov r1, #0xC0               ; case 0xC0
    cmp r0, r1
    bne level_case_end
    mov r1, #0
    ldr r3, speed_pos_addr
    strb r1, [r3, #0]           ; speed_pos = 0 
    mov r3, #LEVEL_ONE_TIME
    str r3, [r2, #0]            ; level_time = LEVEL_ONE_TIME

level_case_default:
level_case_end:
    pop pc

level_addr:
    .word level

level_time_addr:
    .word level_time

speed_pos_addr:
    .word speed_pos


; void game_setup()
; setups environment to start a new game
game_setup:
    push lr
    mov r1, #0
    ; points = 0
    ldr r0, points_addr
    str r1, [r0, #0]
    ; ball_pos = 0
    ldr r0, ball_pos_addr
    strb r1, [r0, #0]
    ; outport_write(ball_pos_array[ball_pos])
    ldr r0, ball_pos_arr_addr
    ldrb r0, [r0, r1]
    bl outport_write
    ; ball_dir = 1 (forwards)
    mov r1, #1 ; forwards
    ldr r0, ball_dir_addr
    strb r1, [r0, #0]
    pop pc

points_addr:
    .word points

ball_pos_addr:
    .word ball_pos

ball_pos_arr_addr:
    .word ball_pos_arr

ball_dir_addr:
    .word ball_dir


; void playing()
; playing state
playing:
    push lr

playing_while:
    ; if (elapsed(timer_level) > level_time)
    ldr r0, timer_level_addr
    ldr r0, [r0, #0]    ; r0 = timer_level
    bl elapsed
    ldr r1, level_time_addr_
    ldr r1, [r1, #0]    ; r1 = level_time
    cmp r0, r1          ; if (time_elapsed > level_time)
    bhs playing_check

    ; if (elapsed(timer_score) > 750ms)
    ldr r0, timer_score_addr
    ldr r0, [r0, #0]    ; r0 = timer_score
    bl elapsed
    mov r1, #AFTER_POINTS_NOTIFY
    cmp r0, r1          ; if (time_elapsed > 750ms)
    bhs points_notify

    ; if (elapsed(timer_score) > 750ms)
    ldr r0, timer_score_addr
    ldr r0, [r0, #0]    ; r0 = timer_score
    bl elapsed
    mov r1, #AFTER_POINTS_DISMISS
    cmp r0, r1          ; if (time_elapsed > 250ms)
    bhs points_dismiss

playing_while_end:
    pop pc

timer_level_addr:
    .word timer_level

timer_score_addr:
    .word timer_score

level_time_addr_:
    .word level_time


; void invert_movement()
; invert the ball movement direction
; 0 = backwards
; 1 = forwards
invert_movement:
    push lr
    ldr r0, ball_dir_addr__
    ldrb r3, [r0, #0]
    mov r1, #1              ; 1 = forwards
    cmp r3, r1              ; if (ball_dir != forwards) ball_dir = forwards
    bne invert_movement_to_fw
    mov r1, #0              ; ball_dir = backwards
    strb r1, [r0, #0]
    b invert_movement_exit
invert_movement_to_fw:
    mov r1, #1              ; ball_dir = forwards
    strb r1, [r0, #0]
invert_movement_exit:
    pop pc


; void playing_check()
; check conditions AFTER(level_time)
playing_check:
    push lr
    ldr r3, ball_pos_addr__
    ldrb r3, [r3, #0]           ; r3 = ball_pos
    mov r1, #WALL_POS
    cmp r3, r1  ; if (ball_pos != wall_pos)
    bne check_if_on_player

    ; hitted wall:
    bl invert_movement
    ldr r0, level_addr_
    ldrb r0, [r0, #0]
    mov r1, #0xC0
    cmp r0, r1  ; if level != random_speed
    bne move_ball_and_continue

    ; we are on mixed speed, so pick next one
    ldr r0, speed_pos_addr_
    ldrb r0, [r0, #0]   ; r0 = speed_pos
    mov r1, #0x05
    cmp r0, r1  ; if speed_pos >= speed_array.len (so we dont get out of bounds)
    bhs move_ball_and_continue
    bl next_random_speed
    b move_ball_and_continue

check_if_on_player:
    mov r1, #PLAYER_POS
    cmp r3, r1 ; if (ball_pos != player_pos)
    bne move_ball_and_continue

    ; we are on the player
    ; check if backwards, if yes, wait for player_move
    ldr r1, ball_dir_addr__
    ldrb r1, [r1, #0]
    mov r0, #0 ; backwards
    cmp r0, r1
    bne move_ball_and_continue ; if not backwards
    
    bl player_move
    mov r1, #0
    cmp r0, r1  ; if (!game_not_over)
    bne playing_check_end

    ; game over
    mov r1, #STATE_OVER
    ldr r0, sm_state_addr__
    strb r1, [r0, #0]
    b playing_check_end

move_ball_and_continue:
    bl move_ball
    b playing_check_end

playing_check_end:
    bl sysclk_get_ticks
    ldr r1, timer_level_addr_
    str r0, [r1, #0]
    pop pc

ball_dir_addr__:
    .word ball_dir

level_addr_:
    .word level

speed_pos_addr_:
    .word speed_pos

sm_state_addr__:
    .word sm_state

ball_pos_addr__:
    .word ball_pos


; void next_random_speed()
; chooses next speed depending on current index (speed_pos)
next_random_speed:
    push lr
    ldr r0, speed_pos_addr__
    ldrb r0, [r0, #0]           ; r0 = speed_pos
    ldr r2, speed_array_addr    ; r2 = &speed_array
    ldrb r1, [r2, r0]           ; r1 = speed_array[speed_pos]
    ldr r0, level_time_addr__   ; r0 = &level_time
    strb r1, [r0, #0]           ; *level_time = speed_array[speed_pos]

    ;speed_pos++
    ldr r1, speed_pos_addr__
    ldrb r0, [r1, #0]           ; r0 = speed_pos
    add r3, r0, #1              ; speed_pos++
    strb r3, [r1, #0]

    pop pc

speed_array_addr:
    .word speed_array

speed_pos_addr__:
    .word speed_pos


; void player_move()
; waits for player stroke
; if level_time passed, game over
; if stroke_valid, invert movement, and jump to playing again
; returns 1 if success, 0 if game over
player_move:
    push lr
    bl sysclk_get_ticks
    ldr r1, timer_level_addr_
    str r0, [r1, #0]
while_no_stroke:
    ldr r1, timer_level_addr_
    ldr r0, [r1, #0]
    bl elapsed      ; r0 = time_elapsed
    ldr r1, level_time_addr__
    ldr r1, [r1, #0]    ; r1 = level_time
    cmp r0, r1  ; if (time_elapsed > level_time)
    bhs player_move_return_error

    bl racket_test_stroke ; while (!racket_test_stroke())
    mov r1, #0
    cmp r0, r1
    beq while_no_stroke ; loop again if no stroke
    bl invert_movement
    b player_move_return_success

player_move_return_error:
    mov r0, #0
    b player_move_end
player_move_return_success:
    mov r1, #1

player_move_end:
    pop pc

timer_level_addr_:
    .word timer_level

level_time_addr__:
    .word level_time


; void points_notify()
; increments points/score and turns ON point LED
; (and update score_timer)
points_notify:
    push lr
    bl point_led_on
    ldr r1, points_addr__     ; r1 = &points_addr
    ldr r0, [r1, #0]
    add r0, r0, #1          ; score++
    str r0, [r1, #0]

    bl sysclk_get_ticks
    ldr r1, timer_score_addr_
    str r0, [r1, #0]
    pop pc

points_addr__:
    .word points


; void points_dismiss()
; OFF point LED and update score_timer
points_dismiss:
    push lr
    bl point_led_off
    bl sysclk_get_ticks
    ldr r1, timer_score_addr_
    str r0, [r1, #0]
    pop pc

timer_score_addr_:
    .word timer_score


; void point_led_on()
; turns ON point LED (O1)
point_led_on:
    push lr
    ldr r0, ball_pos_addr_
    ldrb r0, [r0, #0]        ; r0 = ball_pos
    ldr r1, ball_pos_arr_addr_
    ldrb r1, [r1, r0]        ; r1 = ball_array[ball_pos]
    mov r2, #1 ; mask O1
    orr r0, r1, r2
    bl outport_write
    pop pc


; void point_led_off()
; turns OFF point LED (O1)
point_led_off:
    push lr
    ldr r0, ball_pos_addr_
    ldrb r0, [r0, #0]
    ldr r1, ball_pos_arr_addr_
    ldrb r1, [r1, r0]        ; r1 = current value
    mov r2, #0xFE ; mask every bit except O0
    and r0, r1, r2
    bl outport_write
    pop pc


; void move_ball()
; moves the ball, incrementing/decrementing ball_pos
; (depends if forwards or backwards)
; and sending to output port ball_pos_arr[ball_pos]
move_ball:
    push lr
    ldr r0, ball_pos_addr_   ; r0 = &ball_pos
    ldrb r1, [r0, #0]       ; r1 = ball_pos
    ldr r2, ball_dir_addr_   ; r2 = &ball_dir
    ldrb r2, [r2, #0]       ; r2 = ball_dir
    mov r3, #GOING_BACKWARDS
    cmp r2, r3              ; if (ball_dir == backwards)
    beq move_ball_left
move_ball_right:
    add r1, r1, #1          ; ball_dir++ (we are going forwards)
    b move_ball_exit
move_ball_left:
    sub r1, r1, #1          ; ball_dir-- (we are going backwards)
move_ball_exit:
    strb r1, [r0, #0]       ; update ball_pos
    ldr r0, ball_pos_arr_addr_
    ldrb r0, [r0, r1]       ; r0 = ball_pos_array[ball_pos]
    bl outport_write
    pop pc

ball_pos_addr_:
    .word ball_pos

ball_dir_addr_:
    .word ball_dir

ball_pos_arr_addr_:
    .word ball_pos_arr


; void game_over()
; shows points and go back to initial state
game_over:
    push lr
    bl show_score
    mov r0, #DELAY_GAME_OVER
    movt r0, #DELAY_GAME_OVER
    bl delay
    mov r0, #STATE_STANDBY
    ldr r1, sm_state_addr_
    strb r0, [r1, #0]       ; sm_state = STANDBY
    pop pc

sm_state_addr_:
    .word sm_state


; void show_score()
; shows the score writing player_score to OUTPUT port
show_score:
	push lr
    mov r0, #0
    bl outport_write        ; clear
	ldr r0, points_addr_
    ldr r0, [r0, #0]        ; r0 = points
    bl outport_write        ; show points
	pop pc

points_addr_:
    .word points


; elapsed(uint16_t t0)
; returns (sysclk_get_tick() - t0)
elapsed:
    push lr
    mov r1, r0 ; r1 = t0
    bl sysclk_get_ticks
    sub r0, r0, r1
    pop pc


; uint8_t inport_read()
; Descricao: Reads and returns value from INPUT PORT. 
inport_read:
	ldr	r1, inport_addr
	ldrb r0, [r1, #0]
	mov	pc, lr

inport_addr:
	.word	INPORT_ADDRESS


; void outport_write(uint16_t value)
; Writes [value] aKa r0 to OUTPUT PORT
outport_write:
	ldr	r1, outport_addr
	strb r0, [r1, #0]
	mov	pc, lr


; void delay( uint16_t hms )
; sleeps for [hms]
delay:
	and r0, r0, r0
	bzs delay_end
delay_loop:
	sub r0, r0, #1
	bzc delay_loop
delay_end:
	mov pc, lr


; void outport_clear_bits( uint8_t pins_mask )
; Clears all bits masked from OUTPUT PORT
outport_clear_bits:
	push lr
	ldr	r1, outport_img_addr
	ldrb r2, [r1, #0]
	mvn	r0, r0
	and	r0, r2, r0
	strb r0, [r1]
	bl	outport_write
	pop	pc


; void outport_init(uint8_t value)
; Inits the output port with [value].
outport_init:
	push lr
	ldr	r1, outport_img_addr
	strb r0, [r1]
	bl	outport_write
	pop	pc

outport_addr:
	.word	OUTPORT_ADDRESS

outport_img_addr:
	.word	outport_img


; uint16_t sysclk_get_ticks()
; Returns actual sysclk value.
sysclk_get_ticks:
	ldr	r0, sysclk_addr
	ldr	r0, [r0, #0]
	mov	pc, lr


; void isr()
; Increments sysclk.
isr:
    push r0
    push r1
    ldr r0, PTC_ADDR
	strb r0, [r0, #PTC_TIR] ; clean PTC TIR
    ldr r0, sysclk_addr
    ldr r1, [r0, #0]
    add r1, r1, #1
    str r1, [r0, #0]
	pop r1
    pop r0
    movs pc, lr

sysclk_addr:
	.word sysclk


; void ptc_start()
; starts the pTC counter
ptc_start:
	ldr	r0, PTC_ADDR
	mov	r1, #PTC_CMD_START
	strb	r1, [r0, #PTC_TCR]
	mov	pc, lr

 
; void ptc_stop()
; stops the pTC counter, setting TC register to 0
ptc_stop:
	ldr	r0, PTC_ADDR
	mov	r1, #PTC_CMD_STOP
	strb	r1, [r0, #PTC_TCR]
	mov	pc, lr


; uint8_t ptc_get_value()
; returns actual value of pTC counter
ptc_get_value:
	ldr	r1, PTC_ADDR
	ldrb r0, [r1, #PTC_TC]
	mov	pc, lr


; void ptc_init( uint8_t interval )
; inits a new pTC counter with [interval] count (ticks)
; it also cleans interrupt pending requests if there are any
ptc_init:
	push lr
	push r4
	mov r4, r0
	bl ptc_stop
	ldr r1, PTC_ADDR
    strb r4, [r1, #PTC_TMR] ; meter TMR a interval
	strb r1, [r1, #PTC_TIR] ; limpar PTC TIR
	bl ptc_start
	pop r4
    pop pc

PTC_ADDR:
	.word	PTC_ADDRESS


;; ----------------------------------------------------------------------------
    ;; .data = INITIALIZED GLOBAL DATA
    .data

ball_pos_arr:
    .byte 0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02
    
speed_array:
    .byte LEVEL_ONE_TIME, LEVEL_TWO_TIME, LEVEL_THREE_TIME, 0x2, 0x1

sm_state:
    .byte 0
    .align

points:
    .word 0

ball_dir:
    .byte 1
    .align

ball_pos:
    .byte 0 
    .align

speed_pos:
    .byte 0
    .align


;; ----------------------------------------------------------------------------
    ;; .bss = NON INITIALIZED GLOBAL DATA
    .section .bss

level:
    .space 1
    .align

level_time:
    .space 2

timer_level:
    .space 2

timer_score:
    .space 2

outport_img:
	.space	1
	.align

sysclk:
	.space	2


;; ----------------------------------------------------------------------------
    ;; .section .stack = IMPLEMENT STACK
	.section .stack
	.space	STACK_SIZE
stack:
 
