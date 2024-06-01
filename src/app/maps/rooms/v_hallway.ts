import type { RoomDefinition } from '../../game_map'
import { Mappings as M } from '../../mapping'

export const vHallway: RoomDefinition['cells'] = [
  [
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
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
        mapping: M.floor_tile_small_broken_B,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
        orientation: 0.5,
      },
    ],
  ],
  [
    [
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
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
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
        orientation: 0.5,
      },
    ],
  ],
  [
    [
      {
        mapping: M.floor_tile_small_broken_A,
        position: { x: 0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: 0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
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
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: 0.25 },
        shape: 'box',
      },
      {
        mapping: M.floor_tile_small,
        position: { x: -0.25, z: -0.25 },
        shape: 'box',
      },
      {
        mapping: M.wall,
        orientation: 0.5,
      },
    ],
  ],
]
