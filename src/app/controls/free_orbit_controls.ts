import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Engine } from '../engine'
import { BaseKeyboardControls } from './base_keyboard_controls'

export interface Params {
  engine: Engine
}

export class FreeOrbitControls extends BaseKeyboardControls {
  params: Params
  engine: Engine
  controls: ThreeOrbitControls

  constructor(params: Params) {
    super(params)

    this.controls = new ThreeOrbitControls(this.engine.camera, this.engine.canvas)
    this.startListeners()
  }

  update() {
    super.update()
    this.controls.update()
  }
}
