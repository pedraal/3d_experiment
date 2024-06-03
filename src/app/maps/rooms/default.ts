import type { RoomDefinition } from '../../game_map'
import { Mappings as M } from '../../mapping'

export const defaultRoom: RoomDefinition['cells'] = [
  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall_half,
        position: { x: 0, z: -0.5 },
      },
      {
        mapping: M.wall_half,
        position: { x: -0.5, z: 0.5 },
        orientation: 0.5,
      },
      {
        mapping: M.wall_corner,
        position: { x: -0.5, z: -0.5 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0, z: -0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'south_left',
        mapping: M.wall,
        position: { x: 0, z: -0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'south',
        mapping: M.wall,
        position: { x: 0, z: -0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'south_right',
        mapping: M.wall,
        position: { x: 0, z: -0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0, z: -0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall_half,
        position: { x: -0.5, z: -0.5 },
      },
      {
        mapping: M.wall_half,
        position: { x: 0.5, z: 0.5 },
        orientation: 0.5,
      },
      {
        mapping: M.wall_corner,
        position: { x: 0.5, z: -0.5 },
        orientation: 0,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: -0.5, z: 0 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'west_left',
        mapping: M.wall,
        position: { x: -0.5, z: 0 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'east_right',
        mapping: M.wall,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'west',
        mapping: M.wall,
        position: { x: -0.5, z: 0 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'east',
        mapping: M.wall,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'west_right',
        mapping: M.wall,
        position: { x: -0.5, z: 0 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'east_left',
        mapping: M.wall,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: -0.5, z: 0 },
        orientation: 0.5,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
    ],
  ],

  [
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall_half,
        position: { x: -0.5, z: -0.5 },
        orientation: 1.5,
      },
      {
        mapping: M.wall_half,
        position: { x: 0, z: 0.5 },
      },
      {
        mapping: M.wall_corner,
        position: { x: -0.5, z: 0.5 },
        orientation: 1,
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0, z: 0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'north_left',
        mapping: M.wall,
        position: { x: 0, z: 0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'north',
        mapping: M.wall,
        position: { x: 0, z: 0.5, y: 0 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mod_type: 'wall',
        mod_id: 'north_right',
        mapping: M.wall,
        position: { x: 0, z: 0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall,
        position: { x: 0, z: 0.5 },
      },
    ],
    [
      {
        mapping: M.floor_tile_large,
        shape: 'box',
      },
      {
        mapping: M.wall_half,
        position: { x: 0.5, z: 0 },
        orientation: 0.5,
      },
      {
        mapping: M.wall_half,
        position: { x: -0.5, z: 0.5 },
      },
      {
        mapping: M.wall_corner,
        position: { x: 0.5, z: 0.5 },
        orientation: 1.5,
      },
    ],
  ],
]
