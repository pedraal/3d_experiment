import * as THREE from 'three'
import type { Character } from '../character'
import type { Engine } from '../engine'

interface Params {
  engine: Engine
}

export class BaseKeyboardControls {
  params: Params
  engine: Engine
  camera: THREE.PerspectiveCamera
  target: Character
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  velocity: THREE.Vector3
  quaternion: THREE.Quaternion

  constructor(params: Params) {
    this.params = params
    this.engine = this.params.engine
    this.camera = this.engine.camera
    this.velocity = new THREE.Vector3()
    this.quaternion = new THREE.Quaternion()
    this.forward = false
    this.backward = false
    this.left = false
    this.right = false
    this.jump = false

    this.startListeners()
    this.engine.updatables.push(this)
  }

  assignTarget(target: Character) {}

  update() {
    this.updateVelocity()
  }

  updateVelocity() {
    if (this.forward) this.velocity.z = 1
    else if (this.backward) this.velocity.z = -1
    else this.velocity.z = 0

    if (this.left) this.velocity.x = 1
    else if (this.right) this.velocity.x = -1
    else this.velocity.x = 0

    if (this.jump) this.velocity.y = 2
    else this.velocity.y = 0
  }

  startListeners() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  stopListeners() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'z':
      case 'ArrowUp':
        this.backward = false
        this.forward = true
        break
      case 's':
      case 'ArrowDown':
        this.forward = false
        this.backward = true
        break
      case 'q':
      case 'ArrowLeft':
        this.right = false
        this.left = true
        break
      case 'd':
      case 'ArrowRight':
        this.left = false
        this.right = true
        break
      case ' ':
        this.jump = true
        break
    }
  }

  onKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'z':
      case 'ArrowUp':
        this.forward = false
        break
      case 's':
      case 'ArrowDown':
        this.backward = false
        break
      case 'q':
      case 'ArrowLeft':
        this.left = false
        break
      case 'd':
      case 'ArrowRight':
        this.right = false
        break
      case ' ':
        this.jump = false
        break
    }
  }
}
