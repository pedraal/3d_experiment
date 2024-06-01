// @ts-expect-error
import { MapControls as ThreeMapControls } from 'three/examples/jsm/controls/MapControls'
import type { Engine } from '../engine'
import { BaseKeyboardControls } from './base_keyboard_controls'

export interface Params {
  engine: Engine
}

export class MapControls extends BaseKeyboardControls {
  params: Params
  engine: Engine
  controls: ThreeMapControls

  constructor(params: Params) {
    super(params)

    this.engine.camera.position.set(0, 35, -20)
    this.controls = new ThreeMapControls(this.engine.camera, this.engine.canvas)
    this.startListeners()
  }

  update() {
    super.update()
    this.controls.update()
  }
}
