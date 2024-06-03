import * as THREE from 'three'
import type { Character } from '../character'
import type { Engine } from '../engine'
import { BaseKeyboardControls } from './base_keyboard_controls'

interface Params {
  engine: Engine
}

export class ThirdPersonControls extends BaseKeyboardControls {
  disabled: boolean
  lookBackward: boolean
  isMouseLocked: boolean
  raycaster: THREE.Raycaster

  constructor(params: Params) {
    super(params)
    this.isMouseLocked = false
    this.raycaster = new THREE.Raycaster()
    if (this.engine.params.helpers) {
      const raycasterHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1, 0xff0000)
      this.engine.scene.add(raycasterHelper)
      this.engine.updatables.push({
        update: () => {
          raycasterHelper.setDirection(this.raycaster.ray.direction)
          raycasterHelper.position.copy(this.raycaster.ray.origin)
        },
      })
    }
    this.disable()
    this.startMouseListeners()
  }

  update() {
    const cameraPosition = this.lookBackward ? new THREE.Vector3(0, 2, 5) : new THREE.Vector3(-1, 4, -4)
    const cameraLookAt = this.lookBackward ? new THREE.Vector3(0, 0, -20) : new THREE.Vector3(0, 0, 20)

    let rotatedCameraPosition = this.target.mesh.position
      .clone()
      .add(cameraPosition.clone().applyQuaternion(this.target.mesh.quaternion))
    const rotatedCameraLookAt = this.target.mesh.position
      .clone()
      .add(cameraLookAt.clone().applyQuaternion(this.target.mesh.quaternion))

    rotatedCameraPosition = this.checkCameraObstacles(rotatedCameraPosition)

    this.camera.position.lerp(rotatedCameraPosition, 0.05)
    this.camera.lookAt(rotatedCameraLookAt)

    if (this.disabled) {
      this.velocity.set(0, 0, 0)
      return
    }
    super.update()
  }

  checkCameraObstacles(cameraPosition: THREE.Vector3) {
    const rayOrigin = cameraPosition
      .clone()
      .add(new THREE.Vector3(1, 0, -1).applyQuaternion(this.target.mesh.quaternion))
    const rayTarget = this.target.mesh.position
      .clone()
      .add(new THREE.Vector3(-0.4, 3, 0).applyQuaternion(this.target.mesh.quaternion))
    const rayDirection = rayTarget.clone().sub(rayOrigin).normalize()
    this.raycaster.set(rayOrigin, rayDirection)
    const intersections = this.raycaster.intersectObjects(this.engine.obstacles)
    const distanceToMesh = rayOrigin.distanceTo(rayTarget)
    const intersectionsInBetween = intersections.filter((intersection) => intersection.distance <= distanceToMesh)

    if (intersectionsInBetween.length > 0) {
      const closestIntersection = intersectionsInBetween[intersectionsInBetween.length - 1]
      return closestIntersection.point.add(new THREE.Vector3(0, 0, 1).applyQuaternion(this.target.mesh.quaternion))
    } else {
      return cameraPosition
    }
  }

  assignTarget(target: Character) {
    this.target = target
    const rotation = this.target.body.rotation()
    this.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
  }

  enable() {
    this.disabled = false
    this.lookBackward = false
  }

  disable() {
    this.disabled = true
    this.lookBackward = true
    this.forward = this.backward = this.left = this.right = this.jump = false
    document.exitPointerLock()
  }

  startMouseListeners() {
    document.addEventListener('click', this.onClick)
    document.addEventListener('contextmenu', this.onRightClickPressed)
    document.addEventListener('mouseup', this.onRightClickReleased)
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
  }

  stopMouseListeners() {
    document.addEventListener('click', this.onClick)
    document.removeEventListener('contextmenu', this.onRightClickPressed)
    document.removeEventListener('mouseup', this.onRightClickReleased)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
  }

  onClick = () => {
    if (this.isMouseLocked || this.disabled) return

    this.engine.canvas.requestPointerLock()
  }

  onRightClickPressed = (event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault()
    }
  }

  onRightClickReleased = (event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault()
    }
  }

  onPointerLockChange = () => {
    this.isMouseLocked = document.pointerLockElement === this.engine.canvas
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isMouseLocked) return

    const deltaX = event.movementX

    const rotationSensitivity = 0.003

    this.quaternion = this.quaternion.multiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * rotationSensitivity),
    )
  }
}
