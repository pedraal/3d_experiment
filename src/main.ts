/// <reference types="vite/client" />
import { PhysicDebuggerModes } from './app/engine'
import { Game } from './app/game'

new Game({ engine: { physicsDebugger: PhysicDebuggerModes.Off } })
