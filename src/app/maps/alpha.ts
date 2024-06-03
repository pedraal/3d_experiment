import { GameMap, type MapDefinition } from '../game_map'
import { Mappings } from '../mapping'
import { defaultRoom } from './rooms/default'
import { hHallway } from './rooms/h_hallway'
import { vHallway } from './rooms/v_hallway'

const entrance = structuredClone(defaultRoom)
GameMap.roomModifier(entrance, 'wall', 'north', (ctx) => {
  ctx.mapping.mapping = Mappings.wall_doorway
})

const hub = structuredClone(defaultRoom)
GameMap.roomModifier(hub, 'wall', ['south', 'west', 'east'], (ctx) => {
  ctx.cell.splice(ctx.cell.indexOf(ctx.mapping), 1)
})
GameMap.roomModifier(hub, 'wall', ['south_left', 'south_right'], (ctx) => {
  ctx.mapping.mapping = Mappings.wall_corner
  ctx.mapping.position = { x: 0, z: -0.5 }
  ctx.mapping.orientation = ctx.mapping.mod_id === 'south_left' ? -0.5 : 1
})
GameMap.roomModifier(hub, 'wall', ['east_left', 'east_right', 'west_left', 'west_right'], (ctx) => {
  ctx.mapping.mapping = Mappings.wall_corner
  switch (ctx.mapping.mod_id) {
    case 'east_left':
      ctx.mapping.orientation = 0.5
      break
    case 'east_right':
      ctx.mapping.orientation = 1
      break
    case 'west_left':
      ctx.mapping.orientation = -0.5
      break
    case 'west_right':
      ctx.mapping.orientation = 0
      break
  }
})

const refectory = structuredClone(defaultRoom)
GameMap.roomModifier(refectory, 'wall', 'west', (ctx) => {
  ctx.mapping.mapping = Mappings.wall_doorway
})

const storage = structuredClone(defaultRoom)
GameMap.roomModifier(storage, 'wall', 'east', (ctx) => {
  ctx.mapping.mapping = Mappings.wall_doorway
})

export const alphaMap: MapDefinition = {
  name: 'Alpha',
  cellSize: 4,
  spawn: {
    x: 3,
    y: 1,
    z: 3,
  },
  rooms: [
    GameMap.roomGenerator(entrance, { x: 0, y: 0, z: 0 }),
    GameMap.roomGenerator(vHallway, { x: 2, y: 0, z: 7 }),
    GameMap.roomGenerator(hub, { x: 0, y: 0, z: 10 }),
    GameMap.roomGenerator(hHallway, { x: 7, y: 0, z: 12 }),
    GameMap.roomGenerator(refectory, { x: 10, y: 0, z: 10 }),
    GameMap.roomGenerator(hHallway, { x: -3, y: 0, z: 12 }),
    GameMap.roomGenerator(storage, { x: -10, y: 0, z: 10 }),
  ],
  coins: [
    { x: 2, y: 1, z: 12 },
    { x: 20, y: 1, z: 20 },
    { x: 14, y: 1, z: 28 },
    { x: 6, y: 1, z: 42 },
    { x: 22, y: 1, z: 54 },
    { x: 2, y: 1, z: 59 },
    { x: -22, y: 1, z: 63 },
    { x: -28, y: 1, z: 43 },
    { x: -32, y: 1, z: 55 },
    { x: 43, y: 1, z: 63 },
    { x: 47, y: 1, z: 43 },
    { x: 62, y: 1, z: 55 },
  ],
}
