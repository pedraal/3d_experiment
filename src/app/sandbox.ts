import { Character, Characters } from './character'
import { MapControls } from './controls/map_controls'
import { ThirdPersonControls } from './controls/third_person_controls'
import { Engine, type Params as EngineParams } from './engine'
import { GameMap } from './game_map'
import { alphaMap } from './maps/alpha'
import { State, StateMachine } from './utils/state_machine'

interface Params {
  engine?: EngineParams
  controls: 'tps' | 'map'
}

export class Sandbox {
  params: Params
  engine: Engine
  stateMachine: SandboxStateMachine
  controls: ThirdPersonControls | MapControls
  map: GameMap
  character: Character

  constructor(params: Params) {
    this.params = params
    this.engine = new Engine(this.params.engine || {})
    this.stateMachine = new SandboxStateMachine(this)
    this.stateMachine.setState('loading')
  }

  init() {
    this.initControls()
    this.initMap()
  }

  private initControls() {
    if (this.params.controls === 'tps') {
      this.controls = new ThirdPersonControls({
        engine: this.engine,
      })
    } else if (this.params.controls === 'map') {
      this.controls = new MapControls({ engine: this.engine })
    }
  }

  private initMap() {
    this.map = new GameMap({ engine: this.engine, definition: alphaMap })
  }

  initCharacter() {
    this.character = new Character({
      engine: this.engine,
      name: Object.values(Characters)[Math.floor(Math.random() * Object.values(Characters).length)],
      position: {
        x: this.map.spawn.x,
        y: this.map.spawn.y,
        z: this.map.spawn.z,
      },
      orientation: 0,
      controls: this.controls,
    })
  }

  tick() {
    this.engine.tick((dt, et) => {
      this.stateMachine.currentState?.update(dt, et)
    })
  }
}

class SandboxStateMachine extends StateMachine {
  sandbox: Sandbox
  constructor(sandbox: Sandbox) {
    super()
    this.sandbox = sandbox
    this.init()
  }

  init() {
    this.addState('loading', LoadingState)
    this.addState('idle', IdleState)
  }

  setState(name: string) {
    super.setState(name)
    const body = document.querySelector<HTMLElement>('body')
    if (body) body.dataset.gameState = name
  }
}

class SandboxStateStateMachine extends State {
  machine: SandboxStateMachine
}

class LoadingState extends SandboxStateStateMachine {
  name = 'loading'

  enter() {
    this.machine.sandbox.init()
    this.machine.sandbox.engine.load(this.machine.sandbox.map.mappingsSet()).then(() => {
      this.machine.sandbox.engine.init()
      this.machine.sandbox.map.generate()
      this.machine.sandbox.initCharacter()

      this.machine.setState('idle')
      this.machine.sandbox.tick()
    })
  }

  exit() {
    const loadingEl = document.querySelector<HTMLElement>('#loading')
    if (loadingEl) loadingEl.style.display = 'none'
  }
}

class IdleState extends SandboxStateStateMachine {
  name = 'idle'

  enter() {
    if (this.machine.sandbox.controls instanceof ThirdPersonControls) {
      this.machine.sandbox.controls.enable()
    }
    this.machine.sandbox.character.setPosition(this.machine.sandbox.map.spawn)
    this.machine.sandbox.map.setCoins()
  }
}
