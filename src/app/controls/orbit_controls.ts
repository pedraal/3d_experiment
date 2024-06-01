import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Engine } from '../engine'
import { BaseKeyboardControls } from './base_keyboard_controls'

export interface Params {
  engine: Engine
}

export class OrbitControls extends BaseKeyboardControls {
  params: Params
  engine: Engine
  controls: ThreeOrbitControls

  constructor(params: Params) {
    super(params)

    this.engine.camera.position.set(20, 4, 0)
    this.controls = new ThreeOrbitControls(this.engine.camera, this.engine.canvas)
    this.startListeners()
  }

  update() {
    super.update()
    this.controls.target.set(20, 0, 8)
    this.controls.update()
  }
}
