function SendeWerte () {
    radio.sendValue("EMAX", EntfernungCMMax)
    radio.sendValue("W", Winkel)
    radio.sendValue("E", EntfernungCM)
}
function MesseEntfernung () {
    for (let ListenIndex = 0; ListenIndex <= 4; ListenIndex++) {
        // send pulse
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(2)
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(10)
        pins.digitalWritePin(DigitalPin.P0, 0)
        USPulsdauer = pins.pulseIn(DigitalPin.P1, PulseValue.High)
        if (USPulsdauer > 0 && USPulsdauer < 200000) {
            EntfernungCM = Math.trunc(USPulsdauer * 153 / 29 / 2 / 100)
        } else {
            EntfernungCM = 0
        }
        EntfernungsListe[ListenIndex] = EntfernungCM
    }
    EntfernungsListe.sort()
EntfernungCM = EntfernungsListe[2]
}
radio.onReceivedValue(function (name, value) {
    ZeitstempelEmpfangen = input.runningTime()
    if (name == "F") {
        if (value == 1) {
            Fahren = true
        } else {
            Fahren = false
        }
    } else if (name == "A") {
        serial.writeValue(name, value)
        if (value == 1) {
            Abtasten = true
        } else {
            Abtasten = false
        }
    } else if (name == "L") {
        MotorLinks = value
    } else if (name == "R") {
        MotorRechts = value
    } else if (name == "X") {
        LedX = value
    } else if (name == "Y") {
        LedY = value
    } else {
    	
    }
})
let ServoPulsdauer = 0
let WinkelServo = 0
let LedY = 0
let LedX = 0
let MotorRechts = 0
let MotorLinks = 0
let Abtasten = false
let Fahren = false
let ZeitstempelEmpfangen = 0
let USPulsdauer = 0
let EntfernungCM = 0
let Winkel = 0
let EntfernungCMMax = 0
let EntfernungsListe: number[] = []
let Timeout = 500
let Abtastbereich = 180
let Abtastungen = 20
let VonRechtsNachLinks = true
EntfernungCMMax = 60
EntfernungsListe = [
0,
0,
0,
0,
0
]
radio.setGroup(1)
basic.setLedColor(0x007fff)
serial.redirectToUSB()
basic.forever(function () {
    if (Abtasten) {
        for (let ListenIndex2 = 0; ListenIndex2 <= Abtastungen - 1; ListenIndex2++) {
            if (VonRechtsNachLinks) {
                Winkel = ListenIndex2 * Math.idiv(Abtastbereich, Abtastungen)
            } else {
                Winkel = Abtastbereich - ListenIndex2 * Math.idiv(Abtastbereich, Abtastungen)
            }
            MesseEntfernung()
            SendeWerte()
            WinkelServo = Math.trunc(Winkel / 10) * 10
            ServoPulsdauer = WinkelServo * 1800 / 180 + 600
            ServoPulsdauer = Math.constrain(ServoPulsdauer, 600, 2300)
            Servo.ServoPulse(0, ServoPulsdauer)
            basic.pause(100)
        }
        VonRechtsNachLinks = !(VonRechtsNachLinks)
    } else {
        Servo.Servo(0, 90)
    }
})
basic.forever(function () {
    if (Fahren && input.runningTime() < ZeitstempelEmpfangen + Timeout) {
        basic.setLedColor(0x00ff00)
        basic.clearScreen()
        led.plot(4 - LedX, 4 - LedY)
        motors.dualMotorPower(Motor.A, MotorLinks)
        motors.dualMotorPower(Motor.B, MotorRechts)
    } else {
        basic.setLedColor(0x007fff)
        motors.dualMotorPower(Motor.A, 0)
        motors.dualMotorPower(Motor.B, 0)
    }
})
