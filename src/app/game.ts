import { Character, Characters } from './character'
import type { MapControls } from './controls/map_controls'
import { ThirdPersonControls } from './controls/third_person_controls'
import { Engine, type Params as EngineParams } from './engine'
import { GameMap } from './game_map'
import { alphaMap } from './maps/alpha'
import { State, StateMachine } from './utils/state_machine'

interface Params {
  engine?: EngineParams
}

export class Game {
  params: Params
  engine: Engine
  stateMachine: GameStateMachine
  controls: ThirdPersonControls | MapControls
  map: GameMap
  character: Character

  constructor(params: Params) {
    this.params = params
    this.engine = new Engine(this.params.engine || {})
    this.stateMachine = new GameStateMachine(this)
    this.stateMachine.setState('loading')
  }

  init() {
    this.controls = new ThirdPersonControls({
      engine: this.engine,
    })
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

class GameStateMachine extends StateMachine {
  game: Game
  constructor(game: Game) {
    super()
    this.game = game
    this.init()
  }

  init() {
    this.addState('loading', LoadingState)
    this.addState('idle', IdleState)
    this.addState('playing', PlayingState)
    this.addState('game-over', GameOverState)
    this.addState('victory', VictoryState)
  }

  setState(name: string) {
    super.setState(name)
    const body = document.querySelector<HTMLElement>('body')
    if (body) body.dataset.gameState = name
  }
}

class GameState extends State {
  machine: GameStateMachine
}

class LoadingState extends GameState {
  name = 'loading'

  enter() {
    this.machine.game.init()
    this.machine.game.engine.load(this.machine.game.map.mappingsSet()).then(() => {
      this.machine.game.engine.init()
      this.machine.game.map.generate()

      this.machine.setState('idle')
      this.machine.game.tick()
    })
  }

  exit() {}
}

class IdleState extends GameState {
  name = 'idle'

  enter() {
    for (const coin of this.machine.game.map.coins) coin.remove()
    if (this.machine.game.character) this.machine.game.character.remove()
    this.machine.game.initCharacter()

    if (this.startEl) {
      this.startEl.addEventListener('click', () => this.machine.setState('playing'))
    }

    if (this.machine.game.controls instanceof ThirdPersonControls) {
      this.machine.game.controls.disable()
    }
  }

  exit() {
    if (this.startEl) {
      this.startEl.removeEventListener('click', () => this.machine.setState('playing'))
    }
  }

  get startEl() {
    return document.querySelector<HTMLElement>('#start')
  }
}

class PlayingState extends GameState {
  name = 'playing'
  // duration = 0
  elapsedTime = 0

  enter() {
    if (this.machine.game.controls instanceof ThirdPersonControls) {
      this.machine.game.controls.enable()
    }
    this.machine.game.character.body.setTranslation(
      { ...this.machine.game.map.spawn, y: this.machine.game.map.spawn.y + this.machine.game.character.yHalfExtend },
      true,
    )

    this.machine.game.map.setCoins(this.machine.game.character)
  }

  update(deltaTime: number) {
    this.elapsedTime += deltaTime

    if (this.remainingCoins.length === 0) {
      // if (this.duration <= 0) {
      //   this.machine.setState('game-over')
      // }

      this.machine.setState('victory')
    }

    if (this.remainingCoinsEl) this.remainingCoinsEl.innerText = this.remainingCoins.length.toString()
    if (this.elapsedTimeEl) this.elapsedTimeEl.innerText = this.elapsedTime.toFixed(2)
  }

  exit() {
    if (this.finalElapsedTimeEl) this.finalElapsedTimeEl.innerText = this.elapsedTime.toFixed(2)
  }

  get remainingCoinsEl() {
    return document.querySelector<HTMLElement>('#remaining-coins')
  }

  get elapsedTimeEl() {
    return document.querySelector<HTMLElement>('#elapsed-time')
  }

  get finalElapsedTimeEl() {
    return document.querySelector<HTMLElement>('#final-elapsed-time')
  }

  get remainingCoins() {
    return this.machine.game.map.coins
  }
}

class GameOverState extends GameState {
  name = 'game-over'
  duration = 5

  enter() {}

  update(deltaTime: number) {
    this.duration -= deltaTime
    if (this.duration <= 0) {
      this.machine.setState('idle')
    }
  }

  exit() {}
}

class VictoryState extends GameState {
  name = 'victory'
  duration = 5

  enter() {}

  update(deltaTime: number) {
    this.duration -= deltaTime
    if (this.duration <= 0) {
      this.machine.setState('idle')
    }
  }

  exit() {}
}
