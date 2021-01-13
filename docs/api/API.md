# API

This is a work in progress.

# Engine

Important: must be placed within the `Canvas` element provided by react-three-fiber. 

```tsx
<Engine
 config                         // optional - object
 worldParams                    // optional - object  
 logicWorker                    // optional - web worker
 logicMappedComponents          // optional - object
 />
```

#### config 
_optional_

```tsx
type config = {
    maxNumberOfDynamicObjects: number // default 100
    updateRate: number // default 1000 / 30 (i.e. physics updates 30 times a second)
}
```

#### worldParams
_optional_

See the [planck.js documentation](https://github.com/shakiba/planck.js/blob/master/docs/interfaces/worlddef.md) for 
details regarding `worldDef`

```tsx
type worldParams = {
    allowSleep: boolean // default to true
    gravity: Vec2 // default to Vec2(0, 0) (i.e. no gravity)
    ...worldDef
}
```

#### logicWorker
_optional_

A Web Worker that will be run as the logic worker, synchronized with the 
physics app. [Read more here.](../../README.md#react-logic-app-worker)


#### logicMappedComponents
_optional_

Facilitates synchronising components from the logic app with the main app. [Read more here.](../../README.md#synchronising-logic-app-with-main-app)

```tsx
type logicMappedComponents = {
    [key: string]: ReactComponent
}
```

See [useSyncWithMainComponent](#useSyncWithMainComponent) for further details.

## useFixedUpdate

Inspired by Unity's `OnFixedUpDate`, `useFixedUpdate` is a hook that enables 
you to call a function after each physics update. For Unity this is the 
recommended way to apply physics effects.

```tsx
import { useFixedUpdate } from "react-three-game-engine"

useFixedUpdate((delta: number) => {
    // do something
})
```

# Physics

## Bodies

#### BodyApi

```tsx
type BodyApi = {
    // planck.js methods
    applyForceToCenter: (vec: Vec2, uuid?: string) => void;
    applyLinearImpulse: (vec: Vec2, pos: Vec2, uuid?: string) => void;
    setPosition: (vec: Vec2, uuid?: string) => void;
    setLinearVelocity: (vec: Vec2, uuid?: string) => void;
    setAngle: (angle: number, uuid?: string) => void;
    // custom
    updateBody: (data: UpdateBodyData, uuid?: string) => void;
}

type UpdateBodyData = {
    fixtureUpdate?: {
        groupIndex?: number,
        categoryBits?: number,
        maskBits?: number,
    }
}

```

For detail on what the planck.js methods do, see the [documentation for planck.js](https://github.com/shakiba/planck.js/blob/master/docs/api/classes/body.md#methods).

#### useBody

```tsx
useBody(PropsFn, Config): [ref: MutableRefObject<Object3D>, api: BodyApi, uuid: string]
```

```tsx
type PropsFn = () => AddBodyDef

type AddBodyDef = {
    bodyType: BodyType,
    fixtures: Fixture[],
    ...BodyDef,
}

type Fixture = BoxFixture | CircleFixture

type BoxFixture = FixtureBase & {
    hx: number,
    hy: number,
    center?: [number, number],
}

type CircleFixture = FixtureBase & {
    radius: number,
}

type FixtureBase = {
    shape: BodyShape,
    fixtureOptions?: Partial<FixtureOpt>,
}

enum BodyShape {
    box = 'box',
    circle = 'circle',
}

enum BodyType {
    static = 'static',
    kinematic = 'kinematic',
    dynamic = 'dynamic'
}

```

```tsx
type Config = {
    listenForCollisions?: boolean;
    applyAngle?: boolean;
    cacheKey?: string;
    uuid?: string;
    fwdRef?: MutableRefObject<Object3D>;
}
```

Note: for `BodyDef` [see the planck.js documentation](https://github.com/shakiba/planck.js/blob/master/docs/api/interfaces/bodydef.md).
Note: for `FixtureOpt` [see the planck.js documentation](https://github.com/shakiba/planck.js/blob/master/docs/api/interfaces/fixtureopt.md).

```tsx
import { useBody, BodyType, BodyShape } from "react-three-game-engine"
import { Vec2 } from "planck-js"

const [ref, api, uuid] = useBody(() => ({
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

Note: if you set `bodyType` to `static` it will not be synchronised with either the main app or 
logic app.

#### createBoxFixture

```tsx
createBoxFixture = ({
  width = 1,
  height = 1,
  center,
  fixtureOptions = {}
}: {
 width?: number,
 height?: number,
 center?: [number, number],
 fixtureOptions?: Partial<FixtureOpt>
}) => BoxFixture
```

```tsx

useBody(() => ({
    type: BodyType.dynamic,
    position: Vec2(0, 0),
    linearDamping: 4,
    fixtures: [
        createBoxFixture({
            width: 2,
            height: 2,
        })      
    ],
}))
```

#### createCircleFixture

```tsx
createCircleFixture = ({
  radius = 1,
  fixtureOptions = {}
}: {
 radius?: number,
 fixtureOptions?: Partial<FixtureOpt>
}) => CircleFixture
```

```tsx

useBody(() => ({
    type: BodyType.dynamic,
    position: Vec2(0, 0),
    linearDamping: 4,
    fixtures: [
        createCircleFixture({
            radius: 2,
        })      
    ],
}))
```

#### useBodyApi

```tsx
useBodyApi: (uuid: string) => BodyApi
```

```tsx
const api = useBodyApi('player')

// ...

api.setLinearVelocity(Vec2(1, 1))

```

#### useSubscribeMesh

```tsx
useSubscribeMesh: (
                    uuid: string, 
                    object: Object3D, 
                    applyAngle: boolean = true, 
                    isDynamic: boolean = true
)
```

```tsx
const ref = useRef<Object3D>(new Object3D())
useSubscribeMesh('player', ref.current, false)
```

# Logic

## Logic Worker

#### logicWorkerHandler

```tsx
logicWorkerHandler: (worker: Worker, appComponent: ReactComponent)
```

```jsx
/* eslint-disable no-restricted-globals */
import { logicWorkerHandler } from "react-three-game-engine";

// because of some weird react/dev/webpack/something quirk
(self).$RefreshReg$ = () => {};
(self).$RefreshSig$ = () => () => {};

logicWorkerHandler(self, require("../path/to/logic/app/component").LgApp)
```

## Logic App

#### withLogicWrapper

```tsx
withLogicWrapper: (appComponent: ReactComponent) => ReactComponent
```

```jsx
import { withLogicWrapper } from "react-three-game-engine";

const App = () => {
    // ... your new logic app goes here
}

export const LgApp = withLogicWrapper(App)
```

#### useSyncWithMainComponent

```
useSyncWithMainComponent: (componentKey: string, uniqueKey: string, props: {}) => UpdateProps

type UpdateProps = (props: {}) => void

```

```tsx
const updateProps = useSyncWithMainComponent("player", "uniqueKey", {
    foo: "bar",
    blah: "blah",
})

// ...

updateProps({
    foo: "updated"
})
```

See [logicMappedComponents](#logicMappedComponents) for implementation details.

## Communication

#### useSendMessage

```tsx
useSendMessage: () => (messageKey: string, data: any) => void
```

```jsx
import { useSendMessage } from "react-three-game-engine"

// ...

const sendMessage = useSendMessage()

// ...

sendMessage('messageKey', "any-data")

```

#### useOnMessage

```tsx
useOnMessage: () => (messageKey: string, callback: (data: any) => void) => UnsubscribeFn
```

```jsx
import { useOnMessage } from "react-three-game-engine"

// ...

const onMessage = useOnMessage()

// ...

const unsubscribe = onMessage('messageKey', (data) => {
  // data -> "any-data"
})

// ...

unsubscribe()

```

## Misc

### Mesh Storage

#### useStoreMesh

```tsx
useStoreMesh: (uuid: string, mesh: Object3D)
```

#### useStoredMesh

```tsx
useStoredMesh: (uuid: string) => Object3D | null
```

### Mesh Instancing

You'll need to install `@react-three/drei`

#### InstancesProvider

Place inside of `<Engine/>`

```tsx
<Engine>
    <InstancesProvider>
        {/*...*/}
    </InstancesProvider>
</Engine>
```

#### InstancedMesh

```tsx
<InstancedMesh
    meshKey                     // unique key
    maxInstances                // maximum number of instances, smaller = better performance
    gltfPath                    // e.g. /model.gltf
    meshProps                   // optional - params that go on <instancedMesh/> for r3f, e.g. castShadow
/>

type Props = {
    meshKey: string,
    maxInstances: number,
    gltfPath: string,
    meshProps?: JSX.IntrinsicElements['instancedMesh']
}

```

gltfPath is passed to `useGltf` from `@react-three/drei`

Place inside of `<InstancesProvider/>`

You need to wrap it with React's `<Suspense/>`

```tsx
<InstancesProvider>
    <Suspense fallback={null}>
        <InstancedMesh meshKey={"example"} 
                       maxInstances={10} 
                       gltfPath={"path/to/model.gltf"}
                       meshProps={{
                            castShadow: true, 
                            receiveShadow: true
                       }}/>
    </Suspense>
</InstancesProvider>
```

#### Instance

```tsx
<Instance
    meshKey         // unique key
    position        // optional    
    rotation        // optional 
    scale           // optional 
    />

type Props = {
    meshKey: string,
    position?: [number, number, number],
    rotation?: [number, number, number],
    scale?: [number, number, number]
}

<Instance meshKey={"example"} position={[10, 20, 0]}/>

```

#### useInstancedMesh

todo...

#### useAddInstance

todo...
