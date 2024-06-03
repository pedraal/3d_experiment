/// <reference types="vite/client" />
import { PhysicDebuggerModes } from '../app/engine'
import { Showcase } from '../app/showcase'

new Showcase({
  engine: {
    debugUi: true,
    physicsDebugger: PhysicDebuggerModes.Off,
  },
  fallingItems: false,
})
