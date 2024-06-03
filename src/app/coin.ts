import type * as THREE from 'three'
import type { Character } from './character'
import type { Engine } from './engine'
import type { GameMap } from './game_map'
import { Mapping, Mappings } from './mapping'

interface CoinParams {
  map: GameMap
  position: { x: number; y: number; z: number }
  character?: Character
}

export class Coin {
  static MappingNames = [Mappings.coin_a, Mappings.coin_b, Mappings.coin_c]
  params: CoinParams
  map: GameMap
  engine: Engine
  mapping: Mapping
  character?: Character
  movementOffset: number

  constructor(params: CoinParams) {
    this.params = params
    this.map = this.params.map
    this.engine = this.map.engine
    this.character = this.params.character
    this.movementOffset = Math.random() * 4
    this.mapping = new Mapping({
      engine: this.engine,
      name: Coin.MappingNames[0],
      position: this.params.position,
      bodyType: 'kinematic',
      shape: 'box',
      manualUpdate: true,
    })
    this.engine.updatables.push(this)
    this.map.coins.push(this)
  }

  update(dt: number, elapsedTime: number) {
    if (this.character?.hitbox.containsPoint(this.mapping.body.translation() as unknown as THREE.Vector3)) this.remove()
    else {
      const { x, z } = this.mapping.body.translation()
      const y = Math.abs(Math.cos(elapsedTime + this.movementOffset) * 2.5) + 1
      this.mapping.body.setTranslation(new this.engine.rapier.Vector3(x, y, z), true)

      const angle = elapsedTime * 2
      this.mapping.body.setRotation(
        new this.engine.rapier.Quaternion(0, Math.sin(angle / 2), 0, Math.cos(angle / 2)),
        true,
      )

      this.mapping.update()
    }
  }

  remove() {
    this.mapping.remove()
    this.engine.updatables = this.engine.updatables.filter((u) => u !== this)
    this.map.coins = this.map.coins.filter((c) => c !== this)
  }
}
