import type RAPIER from '@dimforge/rapier3d/rapier'
import * as THREE from 'three'
import type { Engine } from '../engine'

export class RapierDebugRenderer {
  engine: Engine
  world: RAPIER.World
  rapier: typeof RAPIER
  firstTickDone: boolean
  debugRenderPipeline: RAPIER.DebugRenderPipeline
  mesh: THREE.LineSegments

  constructor(engine: Engine) {
    this.engine = engine
    this.world = engine.world
    this.rapier = engine.rapier
    this.mesh = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ff00 }))

    this.engine.scene.add(this.mesh)
  }

  update() {
    const buffers = this.world.debugRender()
    this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3))
    this.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 3))
  }
}
