import React, {useCallback, useEffect, useRef, useState} from "react"
import {usePhysics} from "./Physics.context";
import PhysicsSync from "./PhysicsSync";
import {generateBuffers} from "../main/worker/utils";
import {Buffers} from "../main/worker/shared/types";
import {getNow} from "../utils/time";


    // var timeouts: any = [];
    // var messageName = "zero-timeout-message";
    //
    // // Like setTimeout, but only takes a function argument.  There's
    // // no time argument (always zero) and no arguments (you have to
    // // use a closure).
    // function setZeroTimeout(fn: any) {
    //     timeouts.push(fn);
    //     self.postMessage(messageName, "*");
    // }
    //
    // function handleMessage(event: any) {
    //     if (event.source == self && event.data == messageName) {
    //         event.stopPropagation();
    //         if (timeouts.length > 0) {
    //             var fn = timeouts.shift();
    //             fn();
    //         }
    //     }
    // }
    //
    // self.addEventListener("message", handleMessage, true);

function sleep(milliseconds: number) {
    return 0
    const date = getNow();
    let currentDate = null;
    do {
        currentDate = getNow();
    } while (currentDate - date < milliseconds);
    return getNow() - date
}

class FixedStep {

    accumulator = 0
    accumulatorRatio = 0
    onStep: any = () => {}
    targetHZ = 0
    dt = 0
    steps = 0
    lastUpdate = getNow()

    constructor(targetHZ: number, dt: number, onStep: any) {
        this.onStep = onStep;
        this.targetHZ = targetHZ;
        console.log('targetHZ', targetHZ, dt)
        this.dt = dt;
    }

    update(dt: number) {
        // this.onStep()
        // return

        const debug = this.steps < 50
        //
        // const now = getNow()
        // const timeDiff = now - this.lastUpdate
        //
        // if (timeDiff >= this.targetHZ) {
        //     if (debug) {
        //         // console.log('stepped', timeDiff, this.targetHZ)
        //     }
        //     this.lastUpdate = now
        //     this.onStep()
        // }
        // // else {
        // //     const diff = this.targetHZ - timeDiff
        // //     if (diff < 2) {
        // //         // if (debug) {
        // //         //     console.log('slept then stepped', diff, timeDiff, this.targetHZ)
        // //         // }
        // //         // sleep(diff)
        // //         this.lastUpdate = now
        // //         this.onStep()
        // //     }
        // // }
        //
        //
        this.steps += 1
        //
        // return

        this.accumulator += dt;

        // take the current delta, plus what remains from last time,
        // and determine how many logical steps fit.
        let steps = Math.floor(this.accumulator / this.targetHZ);

        const timeRemaining = this.targetHZ - this.accumulator

        // if (steps === 0 && timeRemaining <= 2) {
        //     if (debug) {
        //         console.log('sleeping', timeRemaining)
        //     }
        //     const slept = sleep(timeRemaining)
        //     if (debug) {
        //         console.log('slept', slept)
        //     }
        //     this.accumulator += slept
        // }

        steps = Math.floor(this.accumulator / this.targetHZ);

        var totalSteps = steps;

        if (debug) {
            console.log('dt', dt)
            console.log('totalSteps', totalSteps, this.accumulator)
        }

        // Remove what will be consumed this tick.
        // if (steps > 0) this.accumulator -= steps * this.targetHZ;
        if (steps > 0) {
            // console.log('steps', this.accumulator)
            this.accumulator -= steps * this.targetHZ;
        }

        if (debug) {
            console.log('new accumulator', this.accumulator)
        }

        this.accumulatorRatio = this.accumulator / this.targetHZ;

        //console.log('steps this update: ' + steps + ', dt: ' + dt);

        while(steps > 0) {
            this.onStep(this.dt);
            steps--;
        }

        this.steps += 1

        return totalSteps;
    }

}


/*

call repeater, if first

 */
const repeater = (callback: (delta: any) => void, stepRate: number) => {
    let last: number = getNow();
    let running = true;
    let first = true;

    function next() {
        if (first) {
            first = false
        } else {
            // console.timeEnd('update')
        }
        // console.time('update')
        var now = getNow();
        callback(now - last);
        last = now;
        // if (running) setTimeout(next);
    }

    return {
        stop: function() { running = false; },
        next: function() {
          next()
        },
        start: function() {
            last = Date.now();
            next();
            // Array.from({length: stepRate * 2}).forEach((_, index) => {
            //     setTimeout(() => {
            //         next();
            //         setInterval(next, stepRate)
            //     }, index)
            // })
        }
    }
}

// let lastUpdate = getNow()
let logging = false

const PhysicsUpdater: React.FC<{
    stepRate: number,
}> = ({
                                stepRate,
                            }) => {

    const localStateRef = useRef({
        pendingUpdate: false,
        count: 0,
        workerCount: 0,
        lastUpdate: getNow() - stepRate,
    })

    const [connectedWorkers] = useState<{
        [key: string]: {
            onUpdate: (stepCount: number) => void,
        }
    }>({})

    const registerWorker = useCallback((onUpdate: (stepCount: number) => void) => {
        const id = localStateRef.current.workerCount
        localStateRef.current.workerCount += 1
        connectedWorkers[id] = {
            onUpdate,
        }
    }, [])

    const { world } = usePhysics()

    const sendUpdate = useCallback((count: number) => {
        Object.values(connectedWorkers).forEach((workerData) => {
            workerData.onUpdate(count)
        })
    }, [])

    const stepWorld = useCallback((delta: number) => {
        if (localStateRef.current.pendingUpdate) {
            // console.log('already pending update??')
        }
        localStateRef.current.pendingUpdate = true
        const lastUpdate = localStateRef.current.lastUpdate
        const now = getNow()
        const newDelta = (now - lastUpdate)
        if (localStateRef.current.count < 100) {
            // console.log('newDelta', newDelta)
        }
        // const diff = stepRate - newDelta
        if (newDelta < stepRate) {
            // console.log('sleeping...')
            // sleep(stepRate - newDelta)
        }
        const finalDelta = (getNow() - lastUpdate)
        console.log('finalDelta', finalDelta)
        // console.time('processWorld')
        localStateRef.current.lastUpdate = getNow()
        world.step(stepRate / 1000)
        world.clearForces()
        localStateRef.current.count += 1
        // console.timeEnd('processWorld')
        // console.time(`updateStep-${localStateRef.current.count}`)
        // console.log('physicsStep', finalDelta)
        sendUpdate(localStateRef.current.count)
        localStateRef.current.pendingUpdate = false
    }, [])

    const [stepper] = useState(() => new FixedStep(stepRate, stepRate, stepWorld))
    const [repeaterCtl] = useState(() => repeater(function(dt) {
        stepper.update(dt);
    }, stepRate))
    const [updateToggle, setUpdateToggle] = useState(false)

    useEffect(() => {
        const worker = new Worker('data:application/javascript,' +
            encodeURIComponent(`
            
            var start = performance.now();
            var updateRate = ${stepRate};
            
            function getNow() {
                return start + performance.now();
            }
            
            var lastUpdate = getNow();
            var accumulator = 0;
            
            while(true) {
                var now = getNow();
                var delta = now - lastUpdate;
                lastUpdate = now;
                
                accumulator += delta;
                
                if (accumulator > updateRate) {
                    accumulator -= updateRate;
                    self.postMessage('step')
                }
                
            }
        `) );

        worker.onmessage = (event) => {
            if (event.data === 'step') {
                stepWorld(0)
            }
        }
    }, [])

    // useEffect(() => {
    //     repeaterCtl.next()
    //     // setUpdateToggle(state => !state)
    // }, [updateToggle])

    // useEffect(() => {
    //
    //     const stepper = new FixedStep(stepRate, stepRate, stepWorld)
    //
    //     const repeaterCtl = repeater(function(dt) {
    //         stepper.update(dt);
    //     }, stepRate)
    //
    //     repeaterCtl.start();
    //
    //     return () => {
    //         repeaterCtl.stop()
    //     }
    //
    // }, [])

    return (
        <PhysicsSync registerWorker={registerWorker}/>
    )
}

export default PhysicsUpdater