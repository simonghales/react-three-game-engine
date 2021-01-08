# react-three-game-engine

[![Version](https://img.shields.io/npm/v/react-three-game-engine?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/react-three-game-engine)
[![Downloads](https://img.shields.io/npm/dt/react-three-game-engine.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/react-three-game-engine)

A very early experimental work-in-progress package to help provide game engine functionality for [react-three-fiber](https://github.com/pmndrs/react-three-fiber).

### Key Features
- [planck.js](https://github.com/shakiba/planck.js/) 2d physics integration
- Physics update rate independent of frame rate
- `OnFixedUpdate` functionality
- Additional React app running in web worker, sync'd with physics, for handling game logic etc

### Note
The planck.js integration currently isn't fully fleshed out. I've only been adding in support 
for functionality on a as-needed basis for my own games.

Also if you delve into the source code for this package, it's a bit messy!

## Get Started
1. Install required packages

`yarn add react-three-game-engine`

plus

`yarn add three react-three-fiber planck-js`

2. Import and add `<Engine/>` component within your r3f `<Canvas/>` component. 

```jsx
import { Engine } from 'react-three-game-engine'
import { Canvas } from 'react-three-fiber'
```

```jsx
<Canvas>
    <Engine>
        {/* Game components go here */}
    </Engine>
</Canvas>
```

3. Create a planck.js driven physics body

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
}), {})
```

4. Control the body via the returned api

```jsx
api.setLinearVelocity(Vec2(1, 1))
```


