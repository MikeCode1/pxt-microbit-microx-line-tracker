uxMotion.initializePhaseWidthModulationDriver()
uxSensors.initializeLineTracker3Channels(ux.PIN_NUMBER.PIN14, ux.PIN_NUMBER.PIN12, ux.PIN_NUMBER.PIN13)
uxDisplays.intializeOnboardPixelsRobotbit()
radio.setGroup(6)

const maxSpeed: number = 4095.0

let x = 0
let speed = 0
let lineSensorOn = false

let lastDir = "?"

function Move(leftSpeed: number, rightSpeed: number) {
    uxMotion.setMotor(uxMotion.MOTOR.ROBOTBIT_M2A, -leftSpeed)
    uxMotion.setMotor(uxMotion.MOTOR.ROBOTBIT_M1A, -rightSpeed)
}

function getPos(): string {
    return uxSensors.getLinePosition3Channels(
        ux.PIN_NUMBER.PIN12,
        ux.PIN_NUMBER.PIN13,
        ux.PIN_NUMBER.PIN14,
        true
    )
}

radio.onReceivedString(function (receivedString: string) {
    if (receivedString == "a") {
        lineSensorOn = true
    } else if (receivedString == "b") {
        lineSensorOn = false
    } else if (receivedString == "ab") {
    } else if (receivedString == "c") {
    } else if (receivedString == "d") {
    } else if (receivedString == "z") {
    } else if (receivedString == "shake") {
    } else if (!lineSensorOn) {
        // Split string into array e.g. "10,-20" --> ["10", "-20"]
        let yxArray = receivedString.split(",", 2)
        if (yxArray.length >= 2) {
            // Convert string to number
            speed = +yxArray[0]
            speed *= 1.2
            // Round up
            if (speed >= 100)
                speed = 100
            else if (speed <= - 100)
                speed = -100
            // Convert string to number
            x = +yxArray[1]
            x *= 1.2
            if (x >= 100)
                x = 100
            else if (x <= -100)
                x = -100
        }
    }
})

basic.forever(function () {
    let pos = getPos()
    let rightOnLine = (pos[0] == "0")
    let midOnLine = (pos[1] == "0")
    let leftOnLine = (pos[2] == "0")

    if (!leftOnLine && midOnLine && !rightOnLine) {
        // Straight
        if (lineSensorOn) {
            x = 0
            speed = 50
        }
    } else if (leftOnLine && midOnLine && rightOnLine) {
        // Straight
        if (lineSensorOn) {
            x = 0
            speed = 50
        }
    } else if (!leftOnLine && !midOnLine && rightOnLine) {
        // Hard-Right
        if (lineSensorOn) {
            x = 0.75
            speed = 75
        }
        lastDir = "r"
    } else if (!leftOnLine && midOnLine && rightOnLine) {
        // Right
        if (lineSensorOn) {
            x = 0.5
            speed = 50
        }
        lastDir = "r"
    } else if (leftOnLine && !midOnLine && !rightOnLine) {
        // Hard-Left
        if (lineSensorOn) {
            x =  -0.75
            speed = 75
        }
        lastDir = "l"
    } else if (leftOnLine && midOnLine && !rightOnLine) {
        // Left
        if (lineSensorOn) {
            x = -0.5
            speed = 75
        }
        lastDir = "l"
    } else if (lastDir == "l") {
        if (lineSensorOn) {
            x = -1
            speed = 100
        }
    } else if (lastDir == "r") {
        if (lineSensorOn) {
            x = 1
            speed = 100
        }
    } else {
        if (lineSensorOn) {
            x = 1
            speed = 25
        }
    }

    // maxSpeed for motor range
    // speed * 0.01 for speed normalized from -100..100 to -1.0..1.0
    // if x <= 0, right motor to 1.0, left to range 1.0=middle to -1.0=left-most
    // if x >= 0, left motor to 1.0, right to range 1.0=middle to -1.0=right-most
    let rightSpeed: number = Math.round(
        maxSpeed * speed / 100.0 * (x <= 0 ? 1.0 : 1.0 - 2.0 * x)
    )
    let leftSpeed: number = Math.round(
        maxSpeed * speed / 100.0 * (x >= 0 ? 1.0 : 1.0 + 2.0 * x)
    )
    Move(leftSpeed, rightSpeed)

    uxDisplays.setAllOnboardPixels(0, 0, 0)
    if (!rightOnLine)
        uxDisplays.setOnboardPixel1D(0, 64, 64, 64)
    if (!midOnLine)
        uxDisplays.setOnboardPixel1D(1, 64, 64, 64)
    if (!leftOnLine)
        uxDisplays.setOnboardPixel1D(2, 64, 64, 64)
    if (lastDir == "l")
        uxDisplays.setOnboardPixel1D(3, 0, 0, 64)
    else if (lastDir == "r")
        uxDisplays.setOnboardPixel1D(3, 64, 0, 0)
    else
        uxDisplays.setOnboardPixel1D(3, 0, 64, 0)
    uxDisplays.refreshOnboardPixels()

    control.waitMicros(0.1e6)
})
