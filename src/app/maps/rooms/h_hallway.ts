import type { RoomDefinition } from '../../game_map'
import { Mappings as M } from '../../mapping'

export const hHallway: RoomDefinition['cells'] = [
  [
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
  ],
  [
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
  ],
  [
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
      },
    ],
  ],
]
