## ⚠️ Currently under development, use at your own risk

# react-three-game-engine

[![Version](https://img.shields.io/npm/v/react-three-game-engine?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/react-three-game-engine)
[![Downloads](https://img.shields.io/npm/dt/react-three-game-engine.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/react-three-game-engine)

A very early experimental work-in-progress package to help provide game engine functionality for [react-three-fiber](https://github.com/pmndrs/react-three-fiber).

### Key Features
- [planck.js](https://github.com/shakiba/planck.js/) 2d physics integration
- Physics update rate independent of frame rate
- `OnFixedUpdate` functionality
- Additional React app running in web worker, sync'd with physics, for handling game logic etc

I will be working on an example starter-kit: [react-three-game-starter](https://github.com/simonghales/react-three-game-starter) which will be fleshed out over time.

### Note
The planck.js integration currently isn't fully fleshed out. I've only been adding in support 
for functionality on an as-needed basis for my own games.

Note: if you delve into the source code for this package, it's a bit messy!

Note: right now I'm having issues getting this to run via codesandbox via create-react-app, hopefully I can resolve this eventually.

## Get Started

### General / Physics

1. Install required packages

`npm install react-three-game-engine`

plus

`npm install three react-three-fiber planck-js`

2. Create Physics Web Worker

You'll need to create your own web worker to handle the physics. You can
check out my repo [react-three-game-starter](https://github.com/simonghales/react-three-game-starter)
for an example of how you can do so with `create-react-app` without having to eject.

Within this worker you'll need to import `physicsWorkerHandler` and pass it `self` as the param.

Example: 

```js
// worker.js
import {physicsWorkerHandler} from "react-three-game-engine";

// because of some weird react/dev/webpack/something quirk
self.$RefreshReg$ = () => {};
self.$RefreshSig$ = () => () => {};

physicsWorkerHandler(self);
```

3. Import and add [`<Engine/>`](docs/api/API.md#Engine) component within your r3f `<Canvas/>` component. 

```jsx
import { Engine } from 'react-three-game-engine'
import { Canvas } from 'react-three-fiber'
```

And pass it the physics worker you created in the previous step.

```jsx

const physicsWorker = new Worker('path/to/worker.js', { type: 'module' });
    
//...

<Canvas>
    <Engine physicsWorker={physicsWorker}>
        {/* Game components go here */}
    </Engine>
</Canvas>
```

4. Create a planck.js driven physics [body](docs/api/API.md#Bodies)

```jsx
import { useBody, BodyType, BodyShape } from 'react-three-game-engine'
import { Vec2 } from 'planck-js'
```

```jsx
const [ref, api] = useBody(() => ({
    type: BodyType.dynamic,
    position: Vec2(0, 0),
    linearDamping: 4,
    fixtures: [{
        shape: BodyShape.circle,
        radius: 0.55,
        fixtureOptions: {
            density: 20,
        }
    }],
}))
```

5. Control the body via the returned [api](docs/api/API.md#BodyApi)

```jsx
api.setLinearVelocity(Vec2(1, 1))
```

6. Utilise [`useFixedUpdate`](docs/api/API.md#usefixedupdate) for controlling the body

```jsx
import { useFixedUpdate } from 'react-three-game-engine'
```

```jsx

const velocity = Vec2(0, 0)

// ...

const onFixedUpdate = useCallback(() => {

    // ...

    velocity.set(xVel * 5, yVel * 5)
    api.setLinearVelocity(velocity)

}, [api])

useFixedUpdate(onFixedUpdate)

```

### React Logic App Worker

A key feature provided by react-three-game-engine is the separate React app running 
within a web worker. This helps keep the main thread free to handle rendering etc, 
helps keep performance smooth.

To utilise this functionality you'll need to create your own web worker. You can 
check out my repo [react-three-game-starter](https://github.com/simonghales/react-three-game-starter) 
for an example of how you can do so with `create-react-app` without having to eject.

1. Create a React component to host your logic React app, export a new component wrapped with 
[`withLogicWrapper`](docs/api/API.md#withLogicWrapper)

```jsx
import {withLogicWrapper} from "react-three-game-engine";

const App = () => {
    // ... your new logic app goes here
}

export const LgApp = withLogicWrapper(App)
```

2. Set up your web worker like such 
(note requiring the file was due to jsx issues with my web worker compiler)

```jsx
/* eslint-disable no-restricted-globals */
import {logicWorkerHandler} from "react-three-game-engine";

// because of some weird react/dev/webpack/something quirk
(self).$RefreshReg$ = () => {};
(self).$RefreshSig$ = () => () => {};

logicWorkerHandler(self, require("../path/to/logic/app/component").LgApp)
```

3. Import your web worker (this is just example code)

```jsx
const [logicWorker] = useState(() => new Worker('../path/to/worker', { type: 'module' }))
```

4. Pass worker to [`<Engine/>`](docs/api/API.md#Engine)

```jsx
<Engine logicWorker={logicWorker}>
    {/* ... */}
</Engine>
```

You should now have your Logic App running within React within your web worker, 
synchronised with the physics worker as well. 

### Controlling a body through both the main, and logic apps.

To control a body via either the main or logic apps, you would create the body 
within one app via [`useBody`](docs/api/API.md#useBody) and then within the other app you can get api 
access via [`useBodyApi`](docs/api/API.md#useBodyApi).

However you need to know the `uuid` of the body you wish to control. By default 
the uuid is one generated via threejs, but you can specify one yourself.

1. Create body

```jsx
useBody(() => ({
    type: BodyType.dynamic,
    position: Vec2(0, 0),
    linearDamping: 4,
    fixtures: [{
        shape: BodyShape.circle,
        radius: 0.55,
        fixtureOptions: {
            density: 20,
        }
    }],
}), {
    uuid: 'player'
})
```

2. Get body api

```jsx
const api = useBodyApi('player')

// ...

api.setLinearVelocity(Vec2(1, 1))

```

So with this approach, you can for example initiate your player body via the logic app, 
and then get api access via the main app, and use that to move the body around.

3. Additionally, if you are creating your body in main / logic, you'll likely want to have 
access to the position / rotation of the body as well.

You can use [`useSubscribeMesh`](docs/api/API.md#useSubscribeMesh) and pass in a ref you've created, which will synchronize 
with the physics body.

```jsx
const ref = useRef<Object3D>(new Object3D())
useSubscribeMesh('player', ref.current, false)

// ...

return (
    <group ref={ref}>
        {/*...*/}
    </group>
)

```

### Synchronising Logic App with Main App

I've added in [`useSyncWithMainComponent`](docs/api/API.md#useSyncWithMainComponent) to sync from the logic app to the main app

1. Within a component running on the logic app

```jsx
const updateProps = useSyncWithMainComponent("player", "uniqueKey", {
    foo: "bar"
})

// ...

updateProps({
    foo: "updated"
})


```

2. Then within the main app

```jsx
const Player = ({foo}) => {
    // foo -> "bar"
    // foo -> "updated"
}

const mappedComponents = {
    "player": Player
}

<Engine logicWorker={logicWorker} logicMappedComponents={mappedComponents}>
    {/* ... */}
</Engine>

```

When [`useSyncWithMainComponent`](docs/api/API.md#useSyncWithMainComponent) is mounted / unmounted, the `<Player/>` 
component will mount / unmount.

Note: currently this only supports sync'ing from logic -> main, but I will add in the 
reverse soon.

### Communication 

To communicate between the main and logic workers you can use [`useSendMessage`](docs/api/API.md#useSendMessage) 
to send and [`useOnMessage`](docs/api/API.md#useOnMessage) to subscribe

```jsx
import {useSendMessage} from "react-three-game-engine"

// ...

const sendMessage = useSendMessage()

// ...

sendMessage('messageKey', "any-data")

```

```jsx
import {useOnMessage} from "react-three-game-engine"

// ...

const onMessage = useOnMessage()

// ...

const unsubscribe = onMessage('messageKey', (data) => {
  // data -> "any-data"
})

// ...

unsubscribe()

```

## API

[Read the API documentation](docs/api/API.md)


