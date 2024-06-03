import * as THREE from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { MapControls } from '../controls/map_controls'
import { Engine, type Params as EngineParams } from '../engine'
import { Mapping, Mappings } from '../mapping'
import { State, StateMachine } from '../utils/state_machine'

interface Params {
  engine?: EngineParams
}

export class MapBuilder {
  params: Params
  engine: Engine
  stateMachine: MapBuilderStateMachine
  raycaster: THREE.Raycaster
  mappings: Mapping[]
  controls: MapBuilderControls
  panel: MapBuilderPanel

  constructor(params: Params) {
    this.params = params
    this.engine = new Engine({ helpers: true, debugUi: true, physicsDebugger: 1, ...params.engine })
    this.stateMachine = new MapBuilderStateMachine(this)
    this.stateMachine.setState('loading')
    this.mappings = []
    this.panel = new MapBuilderPanel(this)
    this.controls = new MapBuilderControls(this)
  }

  tick() {
    this.engine.tick((dt, et) => {
      this.stateMachine.currentState?.update(dt, et)
    })
  }

  removeTarget() {
    if (!this.controls.transformControls.object) return

    const id = this.controls.transformControls.object.userData.id
    const mapping = this.mappings.find((m) => m.id === id)
    if (!mapping) return

    mapping.remove()

    this.controls.transformControls.detach()
    this.mappings = this.mappings.filter((m) => m.id !== id)
  }

  createMapping(name: Mappings, position: [number, number, number], quaternion?: [number, number, number, number]) {
    const mapping = new Mapping({
      engine: this.engine,
      position: new THREE.Vector3().fromArray(position.map((p) => Math.round(p * 100) / 100)),
      quaternion,
      name,
      shape: 'trimesh',
      manualUpdate: true,
    })
    this.mappings.push(mapping)

    return mapping
  }

  get storedMap() {
    return localStorage.getItem('map') || '[]'
  }

  set storedMap(stringMap: string) {
    localStorage.setItem('map', stringMap)
  }

  serializeMap() {
    return JSON.stringify(
      this.mappings.map((m) => {
        return {
          id: m.id,
          name: m.name,
          position: m.mesh.position.toArray(),
          quaternion: m.mesh.quaternion.toArray(),
        }
      }),
      null,
      2,
    )
  }

  importMap() {
    const data = JSON.parse(this.storedMap)
    for (const mapping of data) {
      this.createMapping(Mappings[mapping.name as keyof typeof Mappings], mapping.position, mapping.quaternion)
    }
  }
}

class MapBuilderStateMachine extends StateMachine {
  builder: MapBuilder
  constructor(builder: MapBuilder) {
    super()
    this.builder = builder
    this.init()
  }

  init() {
    this.addState('loading', LoadingState)
    this.addState('ready', ReadyState)
  }

  setState(name: string) {
    super.setState(name)
    const body = document.querySelector<HTMLElement>('body')
    if (body) body.dataset.gameState = name
  }
}

class MapBuilderState extends State {
  machine: MapBuilderStateMachine
}

class LoadingState extends MapBuilderState {
  name = 'loading'

  enter() {
    this.machine.builder.engine.load().then(() => {
      this.machine.builder.engine.init()

      this.machine.builder.importMap()

      this.machine.setState('ready')
      this.machine.builder.tick()
    })
  }

  exit() {
    const loadingEl = document.querySelector<HTMLElement>('#loading')
    if (loadingEl) loadingEl.style.display = 'none'
  }
}

class ReadyState extends MapBuilderState {
  name = 'ready'

  enter() {}

  update() {
    this.machine.builder.storedMap = this.machine.builder.serializeMap()
  }
}

class MapBuilderControls {
  builder: MapBuilder
  engine: Engine
  controls: MapControls
  raycaster: THREE.Raycaster
  transformControls: TransformControls
  mouse: THREE.Vector2
  mouseIsDown: boolean
  metaKeyDown: boolean
  selectedMapping: Mappings

  constructor(builder: MapBuilder) {
    this.builder = builder
    this.engine = builder.engine

    this.controls = new MapControls({ engine: this.engine })
    this.raycaster = new THREE.Raycaster()
    this.transformControls = new TransformControls(this.engine.camera, this.engine.canvas)
    this.transformControls.setTranslationSnap(1)
    this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(15))

    this.mouse = new THREE.Vector2(0, 0)
    this.mouseIsDown = false
    this.engine.scene.add(this.transformControls)

    this.metaKeyDown = false
    this.selectedMapping = Mappings[Object.keys(Mappings)[0] as keyof typeof Mappings]

    this.engine.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.engine.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.engine.canvas.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))

    this.transformControls.addEventListener('dragging-changed', () => {
      this.controls.enabled = !this.transformControls.dragging
    })
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseIsDown) return
    this.mouse.x = (event.clientX / this.engine.canvas.clientWidth) * 2 - 1
    this.mouse.y = -(event.clientY / this.engine.canvas.clientHeight) * 2 + 1
  }

  onMouseDown(event: MouseEvent) {
    this.mouseIsDown = true
  }

  onClick(event: MouseEvent) {
    this.mouseIsDown = false
    const newMouse = new THREE.Vector2()
    newMouse.x = (event.clientX / this.engine.canvas.clientWidth) * 2 - 1
    newMouse.y = -(event.clientY / this.engine.canvas.clientHeight) * 2 + 1

    if (this.mouse.distanceTo(newMouse) > 0.01) return this.onMouseMove(event)

    this.raycaster.setFromCamera(newMouse, this.controls.camera)
    if (this.engine.grid) {
      const mappingsIntersects = this.raycaster.intersectObjects(this.builder.mappings.map((m) => m.mesh))
      const gridIntersects = this.raycaster.intersectObject(this.engine.grid, true)
      if (mappingsIntersects.length > 0) {
        const intersectedObject = mappingsIntersects[0].object
        this.transformControls.attach(intersectedObject)
        const mapping = this.builder.mappings.find((m) => m.id === intersectedObject.userData.id)
        if (mapping) {
          this.selectedMapping = mapping.params.name
          this.builder.panel.mappingInput.value = mapping.params.name
        }
      } else if (gridIntersects.length > 0) {
        this.transformControls.detach()
        if (!this.selectedMapping) return

        const mapping = this.builder.createMapping(this.selectedMapping, gridIntersects[0].point.toArray())
        this.transformControls.attach(mapping.mesh)
      }
    }
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Meta':
        this.metaKeyDown = true
        break

      case 'Shift':
        if (this.metaKeyDown) {
          this.transformControls.setTranslationSnap(null)
          this.transformControls.setRotationSnap(null)
        } else {
          this.transformControls.setTranslationSnap(0.25)
          this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(7.5))
        }
        break

      case 't':
        this.transformControls.setMode('translate')
        break

      case 'r':
        this.transformControls.setMode('rotate')
        break

      case 'Backspace':
        this.builder.removeTarget()
        break

      case 'Escape':
        this.transformControls.detach()
        break
    }
  }

  onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'Meta':
        this.metaKeyDown = false
        break

      case 'Shift':
        this.transformControls.setTranslationSnap(1)
        this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(15))
        break
    }
  }
}

class MapBuilderPanel {
  builder: MapBuilder
  constructor(builder: MapBuilder) {
    this.builder = builder

    for (const mapping in Mappings) {
      const option = document.createElement('option')
      option.value = mapping
      option.textContent = mapping
      this.mappingInput.appendChild(option)
    }
    this.mappingInput.addEventListener('change', (event) => {
      const value = (event.target as HTMLSelectElement).value
      this.builder.controls.selectedMapping = Mappings[value as keyof typeof Mappings]
    })
  }

  get mappingInput() {
    return document.querySelector<HTMLSelectElement>('select#mapping') as HTMLSelectElement
  }
}
