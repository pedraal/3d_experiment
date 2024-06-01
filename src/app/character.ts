import type RAPIER from '@dimforge/rapier3d/rapier'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { type Engine, PhysicDebuggerModes } from './engine'
import type { Controls } from './types'
import { GenericModel } from './utils/generic_model'
import { GLTFUtils } from './utils/gltf_utils'
import { State, StateMachine } from './utils/state_machine'

interface Params {
  engine: Engine
  name: string
  position: { x: number; y: number; z: number }
  orientation?: number
  controls?: Controls
}

export class Character extends GenericModel {
  params: Params
  engine: Engine
  mesh: THREE.Group
  mixer: THREE.AnimationMixer
  body: RAPIER.RigidBody
  collider: RAPIER.Collider
  controls: Controls | undefined
  kinematicController: RAPIER.KinematicCharacterController
  stateMachine: CharacterStateMachine
  yHalfExtend: number
  fallingVelocity: number
  bodyToMeshYOffset: number
  bodyRadius: number

  constructor(params: Params) {
    super(params)
    this.params = params
    this.engine = this.params.engine

    this.model = GLTFUtils.cloneGltf(Character.gltfs[this.params.name]) as GLTF

    this.mesh = this.model.scene
    this.mesh.traverse((node) => {
      node.castShadow = true
    })
    this.mesh.rotation.y = Math.PI * (this.params.orientation || 0)

    this.yHalfExtend = this.hitbox.getSize(new THREE.Vector3()).y / 2

    this.body = this.engine.world.createRigidBody(this.engine.rapier.RigidBodyDesc.kinematicPositionBased())

    this.bodyToMeshYOffset = -0.4
    this.bodyRadius = 0.35

    const colliderDesc = this.engine.rapier.ColliderDesc.cuboid(
      this.bodyRadius,
      this.yHalfExtend + this.bodyToMeshYOffset,
      this.bodyRadius,
    )

    this.collider = this.engine.world.createCollider(colliderDesc, this.body)

    this.kinematicController = this.engine.world.createCharacterController(0)
    this.kinematicController.enableAutostep(0.5, 0.01, true)

    this.setPosition(this.params.position)

    this.fallingVelocity = -5

    this.mesh.traverse((node) => {
      if (node instanceof THREE.Bone && node.name === 'handslotl') {
        node.children = node.children.splice(1, 1)
      } else if (node instanceof THREE.Bone && node.name === 'handslotr') {
        node.children = node.children.splice(0, 1)
      }
    })

    this.mixer = new THREE.AnimationMixer(this.mesh)

    this.controls = this.params.controls
    if (this.controls) {
      this.controls.assignTarget(this)
    }

    this.stateMachine = new CharacterStateMachine(this)
    this.stateMachine.setState('idle')

    if (this.engine.params.physicsDebugger !== PhysicDebuggerModes.Strict) this.engine.scene.add(this.mesh)
    this.engine.updatables.push(this)
  }

  setPosition(position: { x: number; y: number; z: number }) {
    this.body.setTranslation(
      {
        ...position,
        y: position.y + this.yHalfExtend,
      },
      true,
    )
  }

  update(dt: number, elapsedTime: number) {
    this.mixer.update(dt)
    this.handleMovement(dt)
    this.stateMachine.currentState?.update(dt, elapsedTime)

    this.mesh.position.copy(this.body.translation() as unknown as THREE.Vector3)
    this.mesh.position.y -= this.yHalfExtend + this.bodyToMeshYOffset
    this.mesh.quaternion.copy(this.body.rotation() as unknown as THREE.Quaternion)
  }

  private handleMovement(dt: number) {
    if (!this.controls) return

    this.body.setRotation(this.controls.quaternion as unknown as RAPIER.Rotation, true)

    let velocity: THREE.Vector3
    if (this.stateMachine.currentState instanceof JumpingState) {
      velocity = this.stateMachine.currentState.velocity.clone()
    } else {
      velocity = this.getControlsVelocity()
      velocity.y = this.fallingVelocity
    }

    velocity.multiplyScalar(6 * dt)

    this.kinematicController.computeColliderMovement(this.collider, velocity)

    const movement = this.kinematicController.computedMovement()
    const newPos = this.body.translation()
    newPos.x += movement.x
    newPos.y += movement.y
    newPos.z += movement.z
    this.body.setNextKinematicTranslation(newPos)
  }

  getControlsVelocity() {
    if (!this.controls) return new THREE.Vector3()
    else return this.controls.velocity.clone().applyQuaternion(this.controls.quaternion)
  }

  getAnimation(name: string) {
    return this.model.animations.find((a) => a.name === name) as THREE.AnimationClip
  }

  get hitbox() {
    return new THREE.Box3().setFromObject(this.mesh)
  }

  remove() {
    this.engine.world.removeRigidBody(this.body)
    this.engine.world.removeCollider(this.collider, false)
    this.engine.world.removeCharacterController(this.kinematicController)
    this.engine.updatables = this.engine.updatables.filter((u) => u !== this)
    this.engine.scene.remove(this.mesh)
  }

  static async load() {
    return GenericModel.load('characters', 'glb', Object.values(Characters))
  }
}

class CharacterStateMachine extends StateMachine {
  character: Character
  constructor(character: Character) {
    super()
    this.character = character
    this.init()
  }

  init() {
    this.addState('idle', IdleState)
    this.addState('running', RunningState)
    this.addState('strafing_left', StrafingLeftState)
    this.addState('strafing_right', StrafingRightState)
    this.addState('walking_backward', WalkingBackwardState)
    this.addState('starting_jump', StartingJumpState)
    this.addState('jumping', JumpingState)
    this.addState('landing_jump', LandingJumpState)
  }

  get direction() {
    const direction = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
    }

    if (!this.character.controls) return direction

    const velocity = this.character.controls.velocity
    if (velocity.y > 1) direction.jump = true
    else if (velocity.z === -1) direction.backward = true
    else if (velocity.x === -1) direction.right = true
    else if (velocity.x === 1) direction.left = true
    else if (velocity.z === 1) direction.forward = true

    return direction
  }
}

class CharacterState extends State {
  machine: CharacterStateMachine
  animation: string
  transitionTime = 0.2
  enterTime = 0.0
  loop: THREE.AnimationActionLoopStyles = THREE.LoopRepeat

  get action() {
    return this.machine.character.mixer.clipAction(this.machine.character.getAnimation(this.animation))
  }

  enter(prevState?: CharacterState) {
    if (prevState) {
      this.action.time = this.enterTime
      this.action.loop = this.loop
      this.action.enabled = true
      this.action.setEffectiveTimeScale(1.0)
      this.action.setEffectiveWeight(1.0)
      this.action.crossFadeFrom(prevState.action, this.transitionTime, true)
      this.action.play()
    } else {
      this.action.play()
    }
  }
}

class IdleState extends CharacterState {
  name = 'idle'
  animation = 'Idle'

  update() {
    if (this.machine.direction.jump) this.machine.setState('starting_jump')
    else if (this.machine.direction.forward) this.machine.setState('running')
    else if (this.machine.direction.backward) this.machine.setState('walking_backward')
    else if (this.machine.direction.left) this.machine.setState('strafing_left')
    else if (this.machine.direction.right) this.machine.setState('strafing_right')
  }
}

class StartingJumpState extends CharacterState {
  name = 'starting_jump'
  animation = 'Jump_Start'
  loop = THREE.LoopOnce

  transitionTime = 0.1
  elapsedTime = 0
  duration = 0.2

  update(dt: number) {
    this.elapsedTime += dt
    if (this.elapsedTime > this.duration) this.machine.setState('jumping')
  }
}

class JumpingState extends CharacterState {
  name = 'jumping'
  animation = 'Jump_Idle'

  transitionTime = 0.1
  persistedVelocity = { x: 0, y: 0, z: 0 }
  initialVerticalVelocity = 3
  rawDecelerationRate = 10
  deceleleration = 0
  velocity = new THREE.Vector3()

  enter(prevState?: CharacterState) {
    super.enter(prevState)
    this.persistedVelocity = this.machine.character.getControlsVelocity().multiplyScalar(1.25)
  }

  update(dt: number) {
    const yVelocity = Math.max(
      this.initialVerticalVelocity - this.deceleleration,
      this.machine.character.fallingVelocity,
    )
    this.velocity.copy(new THREE.Vector3(this.persistedVelocity.x, yVelocity, this.persistedVelocity.z))

    this.machine.character.kinematicController.computeColliderMovement(this.machine.character.collider, this.velocity)
    const collision = this.machine.character.kinematicController.computedCollision(0)
    if (collision?.translationDeltaApplied.y === 0) {
      this.machine.setState('landing_jump')
    }

    this.deceleleration += this.rawDecelerationRate * dt
  }
}

class LandingJumpState extends CharacterState {
  name = 'landing_jump'
  animation = 'Jump_Land'

  enterTime = 0.2
  elapsedTime = 0
  transitionTime = 0.1
  duration = 0.1

  update(dt: number) {
    this.elapsedTime += dt
    if (this.elapsedTime > this.duration) this.machine.setState('idle')
  }
}

class RunningState extends CharacterState {
  name = 'running'
  animation = 'Running_A'

  update() {
    if (this.machine.direction.jump) this.machine.setState('starting_jump')
    else if (!this.machine.direction.forward) this.machine.setState('idle')
    else if (this.machine.direction.backward) this.machine.setState('walking_backward')
    else if (this.machine.direction.left) this.machine.setState('strafing_left')
    else if (this.machine.direction.right) this.machine.setState('strafing_right')
  }
}

class StrafingLeftState extends CharacterState {
  name = 'strafing_left'
  animation = 'Running_Strafe_Left'

  update() {
    if (this.machine.direction.jump) this.machine.setState('starting_jump')
    else if (!this.machine.direction.left) this.machine.setState('idle')
    else if (this.machine.direction.backward) this.machine.setState('walking_backward')
    else if (this.machine.direction.forward) this.machine.setState('running')
    else if (this.machine.direction.right) this.machine.setState('strafing_right')
  }
}
class StrafingRightState extends CharacterState {
  name = 'strafing_right'
  animation = 'Running_Strafe_Right'

  update() {
    if (this.machine.direction.jump) this.machine.setState('starting_jump')
    else if (!this.machine.direction.right) this.machine.setState('idle')
    else if (this.machine.direction.backward) this.machine.setState('walking_backward')
    else if (this.machine.direction.forward) this.machine.setState('running')
    else if (this.machine.direction.left) this.machine.setState('strafing_left')
  }
}

class WalkingBackwardState extends CharacterState {
  name = 'walking_backward'
  animation = 'Walking_Backwards'

  update() {
    if (this.machine.direction.jump) this.machine.setState('starting_jump')
    else if (!this.machine.direction.backward) this.machine.setState('idle')
    else if (this.machine.direction.forward) this.machine.setState('running')
    else if (this.machine.direction.left) this.machine.setState('strafing_left')
    else if (this.machine.direction.right) this.machine.setState('strafing_right')
  }
}

// Assets source : https://kaylousberg.com/game-assets
export enum Characters {
  Knight = 'Knight',
  // Barbarian = 'Barbarian',
  // Mage = 'Mage',
  // Rogue = 'Rogue',
  // Rogue_Hooded = 'Rogue_Hooded',
}
