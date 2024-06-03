import type RAPIER from '@dimforge/rapier3d/rapier'
import * as THREE from 'three'
// @ts-expect-error
import Stats from 'three/examples/jsm/libs/stats.module'
import { Character } from './character'
import { Mapping, type Mappings } from './mapping'
import type { Updatable } from './types'
import { RapierDebugRenderer } from './utils/rapier_debug_renderer'

export enum PhysicDebuggerModes {
  Off = 0,
  On = 1,
  Strict = 2,
}

export interface Params {
  physicsDebugger?: PhysicDebuggerModes
  helpers?: boolean
  debugUi?: boolean
}

export class Engine {
  canvas: HTMLCanvasElement
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  params: Params
  clock: THREE.Clock
  world: RAPIER.World
  physicsDebugger?: RapierDebugRenderer
  stats: Stats
  previousElapsedTime: number
  obstacles: THREE.Object3D[]
  updatables: Updatable[]
  camera: THREE.PerspectiveCamera
  rapier: typeof RAPIER
  grid?: THREE.GridHelper

  constructor(params: Params) {
    this.params = params

    const canvas = document.querySelector('canvas')
    if (!canvas) throw new Error('No canvas found')
    this.canvas = canvas

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.scene = new THREE.Scene()
    this.obstacles = []
    this.camera = new THREE.PerspectiveCamera(90, this.viewport.width / this.viewport.height, 0.1, 10000)
    this.updatables = []

    this.clock = new THREE.Clock()
    this.previousElapsedTime = 0

    if (this.params.debugUi) {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }
    const ambiantLight = new THREE.AmbientLight(0xffffff, 3)
    this.scene.add(ambiantLight)

    const pointLight = new THREE.PointLight(0xfc6603, 3, 0, 0)
    pointLight.position.set(12, 3.75, 25)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    pointLight.shadow.camera.far = 200

    this.scene.add(pointLight)
    if (this.params.helpers) {
      this.scene.add(new THREE.PointLightHelper(pointLight, 1))
      this.grid = new THREE.GridHelper(2000, 2000)
      this.scene.add(this.grid)
      this.scene.add(new THREE.AxesHelper(10))
    }
  }

  load(mappings?: Set<Mappings>) {
    return Promise.all([Character.load(), Mapping.loadMappings(mappings), this.loadRapier()])
  }

  async loadRapier() {
    this.rapier = await import('@dimforge/rapier3d')
  }

  init() {
    this.world = new this.rapier.World({ x: 0, y: -9.81, z: 0 })
    if (this.params.physicsDebugger !== PhysicDebuggerModes.Off) this.physicsDebugger = new RapierDebugRenderer(this)
  }

  tick(update: (deltaTime: number, elapsedTime: number) => void) {
    this.resizeRendererToDisplaySize()

    const elapsedTime = this.clock.getElapsedTime()
    const deltaTime = elapsedTime - this.previousElapsedTime
    this.previousElapsedTime = elapsedTime

    this.world.step()
    if (Math.floor(elapsedTime) % 1 === 0) this.physicsDebugger?.update()
    for (const object of this.updatables) object.update(deltaTime, elapsedTime)
    this.renderer.render(this.scene, this.camera)

    if (this.params.debugUi) this.stats.update()

    update(deltaTime, elapsedTime)
    window.requestAnimationFrame(() => this.tick(update))
  }

  get viewport() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    }
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      this.renderer.setSize(width, height, false)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
  }
}
