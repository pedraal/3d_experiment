import type { Engine } from '../engine'
import { Mapping, Mappings } from '../mapping'

export class GameMap {
  cellSide = 4
  spawn: { x: number; y: number; z: number }
  engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
    this.spawn = {
      x: 0 * this.cellSide,
      y: 1,
      z: 0 * this.cellSide,
    }
  }

  generate() {
    new Mapping({
      engine: this.engine,
      name: Mappings.wall_doorway_scaffold,
      position: { x: 0, y: 0, z: -1.5 },
      shape: 'convex',
    })
    new Mapping({
      engine: this.engine,
      name: Mappings.barrier,
      position: { x: -2, y: 0, z: 0.5 },
      orientation: 0.5,
      shape: 'convex',
    })
    new Mapping({
      engine: this.engine,
      name: Mappings.barrier,
      position: { x: 2, y: 0, z: 0.5 },
      orientation: 0.5,
      shape: 'convex',
    })
    new Mapping({
      engine: this.engine,
      name: Mappings.floor_dirt_large,
      position: { x: 0, y: 0, z: 0 },
      shape: 'convex',
    })
    new Mapping({
      engine: this.engine,
      name: Mappings.stairs,
      position: { x: 0, y: 0, z: 6 },
      orientation: 1,
      shape: 'trimesh',
    })
  }
}
