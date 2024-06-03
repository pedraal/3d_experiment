/// <reference types="vite/client" />
import { PhysicDebuggerModes } from '../app/engine'
import { MapBuilder } from '../app/map_builder'

new MapBuilder({
  engine: {
    physicsDebugger: PhysicDebuggerModes.Off,
  },
})
