import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { MapControls } from './controls/map_controls'
import { Engine, type Params as EngineParams } from './engine'
import { Mapping, Mappings } from './mapping'
import { State, StateMachine } from './utils/state_machine'

interface Params {
  engine?: EngineParams
  fallingItems?: boolean
}

export class Showcase {
  params: Params
  engine: Engine
  stateMachine: ShowcaseStateMachine
  controls: MapControls

  rowLength = 8
  cellSize = 6

  constructor(params: Params) {
    this.params = params
    this.engine = new Engine(this.params.engine || {})
    this.controls = new MapControls({ engine: this.engine })
    this.engine.camera.position.set(0, 15, 20)
    this.stateMachine = new ShowcaseStateMachine(this)
    this.stateMachine.setState('loading')
  }

  init() {
    this.initModelsShowcase()
  }

  initModelsShowcase() {
    const rowLength = 9
    const cellSize = 6

    const firstCellX = -(rowLength / 2) * cellSize
    const firstCellZ = -(rowLength / 2) * cellSize
    let currentRowItem = 0

    let x = firstCellX
    let z = firstCellZ

    for (const name of [...Object.values(Mappings)]) {
      new Mapping({
        engine: this.engine,
        name,
        position: { x, y: 0, z },
        orientation: 0,
        shape: 'trimesh',
      })

      const text = new THREE.Mesh(
        new TextGeometry(name, {
          font: Showcase.font,
          size: 0.2,
          height: 0.01,
        }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      )
      text.geometry.center()
      text.position.set(x, -1, z)
      this.engine.scene.add(text)

      if (this.params.fallingItems)
        new Mapping({
          engine: this.engine,
          name: Mappings.coin_a,
          position: { x, y: 10, z },
          bodyType: 'dynamic',
          shape: 'box',
        })

      if (currentRowItem === rowLength) {
        x = firstCellX
        z += cellSize
        currentRowItem = 0
      } else {
        x += cellSize
        currentRowItem++
      }
    }
  }

  tick() {
    this.engine.tick((dt, et) => {
      // boxBody1.setAngvel({ x: 0, y: 0, z: 1 }, true)
      // boxBody2.setAngvel({ x: 0, y: 0, z: 2 }, true)
    })
  }

  static font
  static async loadFont() {
    if (Showcase.font) return
    const loader = new FontLoader()
    Showcase.font = await loader.loadAsync('/helvetiker_regular.typeface.json')
  }
}

class ShowcaseStateMachine extends StateMachine {
  showcase: Showcase
  constructor(showcase: Showcase) {
    super()
    this.showcase = showcase
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

class ShowcaseStateMachineState extends State {
  machine: ShowcaseStateMachine
}

class LoadingState extends ShowcaseStateMachineState {
  name = 'loading'

  enter() {
    Promise.all([Showcase.loadFont(), this.machine.showcase.engine.load()]).then(() => {
      this.machine.showcase.engine.init()
      this.machine.showcase.init()
      this.machine.setState('idle')
    })
  }

  exit() {
    const loadingEl = document.querySelector<HTMLElement>('#loading')
    if (loadingEl) loadingEl.style.display = 'none'
    this.machine.showcase.tick()
  }
}

class IdleState extends ShowcaseStateMachineState {
  name = 'idle'
}
