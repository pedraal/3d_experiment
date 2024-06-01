import type RAPIER from '@dimforge/rapier3d/rapier'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { type Engine, PhysicDebuggerModes } from './engine'
import { GenericModel } from './utils/generic_model'
import { GLTFUtils } from './utils/gltf_utils'

interface Params {
  engine: Engine
  name: Mappings
  position: { x: number; y: number; z: number }
  orientation?: number
  manualUpdate?: boolean
  obstacle?: boolean
  bodyType?: 'dynamic' | 'fixed' | 'kinematic'
  shape?: 'box' | 'sphere' | 'trimesh' | 'convex'
}

export class Mapping extends GenericModel {
  params: Params
  engine: Engine
  mesh: THREE.Mesh
  body: RAPIER.RigidBody
  collider: RAPIER.Collider
  shape: Params['shape']
  boundingBox: THREE.Box3
  boundingSphere: THREE.Sphere

  constructor(params: Params) {
    super(params)
    this.params = params
    this.engine = this.params.engine

    this.model = GLTFUtils.cloneGltf(Mapping.gltfs[this.params.name]) as GLTF

    const mesh = this.model.scene.children[0].clone(true) as THREE.Mesh
    this.mesh = new THREE.Mesh(mesh.geometry.clone(), mesh.material)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.rotation.y = Math.PI * (this.params.orientation || 0)

    this.mesh.geometry.computeBoundingBox()
    this.mesh.geometry.computeBoundingSphere()
    this.mesh.userData.name = this.params.name
    this.boundingBox = this.mesh.geometry.boundingBox as THREE.Box3
    this.boundingSphere = this.mesh.geometry.boundingSphere as THREE.Sphere

    this.shape = this.params.shape || 'box'
    if (['box', 'sphere'].includes(this.shape)) {
      this.mesh.geometry.center()
    } else {
      this.mesh.geometry.translate(0, -this.boundingBox.min.y, 0)
    }

    let bodyDesc: RAPIER.RigidBodyDesc
    switch (this.params.bodyType) {
      case 'dynamic':
        bodyDesc = this.engine.rapier.RigidBodyDesc.dynamic()
        break
      case 'fixed':
        bodyDesc = this.engine.rapier.RigidBodyDesc.fixed()
        break
      case 'kinematic':
        bodyDesc = this.engine.rapier.RigidBodyDesc.kinematicVelocityBased()
        break
      default:
        bodyDesc = this.engine.rapier.RigidBodyDesc.fixed()
        break
    }

    bodyDesc
      .setTranslation(this.params.position.x, this.params.position.y, this.params.position.z)
      .setRotation(this.mesh.quaternion)

    this.body = this.engine.world.createRigidBody(bodyDesc)
    const colliderDesc = new this.engine.rapier.ColliderDesc(this.colliderShape)

    if (!colliderDesc) throw new Error(`No colliderDesc for ${this.params.name}`)
    this.collider = this.engine.world.createCollider(colliderDesc, this.body)

    if (this.engine.params.physicsDebugger !== PhysicDebuggerModes.Strict) this.engine.scene.add(this.mesh)
    if (!this.params.manualUpdate) this.engine.updatables.push(this)
    if (this.params.obstacle) this.engine.obstacles.push(this.mesh)
  }

  get colliderShape() {
    if (this.params.shape === 'box')
      return new this.engine.rapier.Cuboid(
        ...(this.boundingBox.getSize(new THREE.Vector3()).divideScalar(2).toArray() as [number, number, number]),
      )
    else if (this.params.shape === 'sphere') return new this.engine.rapier.Ball(this.boundingSphere.radius)
    else if (this.params.shape === 'trimesh')
      return new this.engine.rapier.TriMesh(
        new Float32Array(this.mesh.geometry.attributes.position.array),
        new Uint32Array(this.mesh.geometry.index?.array || []),
      )
    else if (this.params.shape === 'convex')
      return new this.engine.rapier.ConvexPolyhedron(new Float32Array(this.mesh.geometry.attributes.position.array))
    else
      return new this.engine.rapier.Cuboid(
        ...(this.boundingBox.getSize(new THREE.Vector3()).divideScalar(2).toArray() as [number, number, number]),
      )
  }

  update() {
    this.mesh.position.copy(this.body.translation() as unknown as THREE.Vector3)
    this.mesh.quaternion.copy(this.body.rotation() as unknown as THREE.Quaternion)
  }

  remove() {
    this.engine.updatables = this.engine.updatables.filter((u) => u !== this)
    this.engine.world.removeRigidBody(this.body)
    this.engine.scene.remove(this.mesh)
  }

  static async loadMappings(mappings?: Set<Mappings>) {
    const toLoad = mappings ? Array.from(mappings) : Object.values(Mappings)
    return GenericModel.load('mappings', 'glb', toLoad)
  }
}

// Assets source : https://kaylousberg.com/game-assets
export enum Mappings {
  banner_blue = 'banner_blue',
  banner_brown = 'banner_brown',
  banner_green = 'banner_green',
  banner_patternA_blue = 'banner_patternA_blue',
  banner_patternA_brown = 'banner_patternA_brown',
  banner_patternA_green = 'banner_patternA_green',
  banner_patternA_red = 'banner_patternA_red',
  banner_patternA_white = 'banner_patternA_white',
  banner_patternA_yellow = 'banner_patternA_yellow',
  banner_patternB_blue = 'banner_patternB_blue',
  banner_patternB_brown = 'banner_patternB_brown',
  banner_patternB_green = 'banner_patternB_green',
  banner_patternB_red = 'banner_patternB_red',
  banner_patternB_white = 'banner_patternB_white',
  banner_patternB_yellow = 'banner_patternB_yellow',
  banner_patternC_blue = 'banner_patternC_blue',
  banner_patternC_brown = 'banner_patternC_brown',
  banner_patternC_green = 'banner_patternC_green',
  banner_patternC_red = 'banner_patternC_red',
  banner_patternC_white = 'banner_patternC_white',
  banner_patternC_yellow = 'banner_patternC_yellow',
  banner_red = 'banner_red',
  banner_shield_blue = 'banner_shield_blue',
  banner_shield_brown = 'banner_shield_brown',
  banner_shield_green = 'banner_shield_green',
  banner_shield_red = 'banner_shield_red',
  banner_shield_white = 'banner_shield_white',
  banner_shield_yellow = 'banner_shield_yellow',
  banner_thin_blue = 'banner_thin_blue',
  banner_thin_brown = 'banner_thin_brown',
  banner_thin_green = 'banner_thin_green',
  banner_thin_red = 'banner_thin_red',
  banner_thin_white = 'banner_thin_white',
  banner_thin_yellow = 'banner_thin_yellow',
  banner_triple_blue = 'banner_triple_blue',
  banner_triple_brown = 'banner_triple_brown',
  banner_triple_green = 'banner_triple_green',
  banner_triple_red = 'banner_triple_red',
  banner_triple_white = 'banner_triple_white',
  banner_triple_yellow = 'banner_triple_yellow',
  banner_white = 'banner_white',
  banner_yellow = 'banner_yellow',
  barrel_large_decorated = 'barrel_large_decorated',
  barrel_large = 'barrel_large',
  barrel_small_stack = 'barrel_small_stack',
  barrel_small = 'barrel_small',
  barrier_colum_half = 'barrier_colum_half',
  barrier_column = 'barrier_column',
  barrier_corner = 'barrier_corner',
  barrier_half = 'barrier_half',
  barrier = 'barrier',
  bed_decorated = 'bed_decorated',
  bed_floor = 'bed_floor',
  bed_frame = 'bed_frame',
  bottle_A_brown = 'bottle_A_brown',
  bottle_A_green = 'bottle_A_green',
  bottle_A_labeled_brown = 'bottle_A_labeled_brown',
  bottle_A_labeled_green = 'bottle_A_labeled_green',
  bottle_B_brown = 'bottle_B_brown',
  bottle_B_green = 'bottle_B_green',
  bottle_C_brown = 'bottle_C_brown',
  bottle_C_green = 'bottle_C_green',
  box_large = 'box_large',
  box_small_decorated = 'box_small_decorated',
  box_small = 'box_small',
  box_stacked = 'box_stacked',
  candle_lit = 'candle_lit',
  candle_melted = 'candle_melted',
  candle_thin_lit = 'candle_thin_lit',
  candle_thin = 'candle_thin',
  candle_triple = 'candle_triple',
  candle = 'candle',
  chair = 'chair',
  chest_gold = 'chest_gold',
  chest = 'chest',
  coin_stack_large = 'coin_stack_large',
  coin_stack_medium = 'coin_stack_medium',
  coin_stack_small = 'coin_stack_small',
  coin = 'coin',
  coin_a = 'coin_a',
  coin_b = 'coin_b',
  coin_c = 'coin_c',
  column = 'column',
  crates_stacked = 'crates_stacked',
  floor_dirt_large_rocky = 'floor_dirt_large_rocky',
  floor_dirt_large = 'floor_dirt_large',
  floor_dirt_small_A = 'floor_dirt_small_A',
  floor_dirt_small_B = 'floor_dirt_small_B',
  floor_dirt_small_C = 'floor_dirt_small_C',
  floor_dirt_small_corner = 'floor_dirt_small_corner',
  floor_dirt_small_D = 'floor_dirt_small_D',
  floor_dirt_small_weeds = 'floor_dirt_small_weeds',
  floor_foundation_allsides = 'floor_foundation_allsides',
  floor_foundation_corner = 'floor_foundation_corner',
  floor_foundation_diagonal_corner = 'floor_foundation_diagonal_corner',
  floor_foundation_front_and_back = 'floor_foundation_front_and_back',
  floor_foundation_front_and_sides = 'floor_foundation_front_and_sides',
  floor_foundation_front = 'floor_foundation_front',
  floor_tile_big_grate_open = 'floor_tile_big_grate_open',
  floor_tile_big_grate = 'floor_tile_big_grate',
  floor_tile_big_spikes = 'floor_tile_big_spikes',
  floor_tile_extralarge_grates_open = 'floor_tile_extralarge_grates_open',
  floor_tile_extralarge_grates = 'floor_tile_extralarge_grates',
  floor_tile_grate_open = 'floor_tile_grate_open',
  floor_tile_grate = 'floor_tile_grate',
  floor_tile_large_rocks = 'floor_tile_large_rocks',
  floor_tile_large = 'floor_tile_large',
  floor_tile_small_broken_A = 'floor_tile_small_broken_A',
  floor_tile_small_broken_B = 'floor_tile_small_broken_B',
  floor_tile_small_corner = 'floor_tile_small_corner',
  floor_tile_small_decorated = 'floor_tile_small_decorated',
  floor_tile_small_weeds_A = 'floor_tile_small_weeds_A',
  floor_tile_small_weeds_B = 'floor_tile_small_weeds_B',
  floor_tile_small = 'floor_tile_small',
  floor_wood_large_dark = 'floor_wood_large_dark',
  floor_wood_large = 'floor_wood_large',
  floor_wood_small_dark = 'floor_wood_small_dark',
  floor_wood_small = 'floor_wood_small',
  keg_decorated = 'keg_decorated',
  keg = 'keg',
  key = 'key',
  keyring_hanging = 'keyring_hanging',
  keyring = 'keyring',
  pillar_decorated = 'pillar_decorated',
  pillar = 'pillar',
  plate_food_A = 'plate_food_A',
  plate_food_B = 'plate_food_B',
  plate_small = 'plate_small',
  plate_stack = 'plate_stack',
  plate = 'plate',
  rubble_half = 'rubble_half',
  rubble_large = 'rubble_large',
  shelf_large = 'shelf_large',
  shelf_small_candles = 'shelf_small_candles',
  shelf_small = 'shelf_small',
  shelves = 'shelves',
  stairs_narrow = 'stairs_narrow',
  stairs_wall_left = 'stairs_wall_left',
  stairs_wall_right = 'stairs_wall_right',
  stairs_walled = 'stairs_walled',
  stairs_wide = 'stairs_wide',
  stairs_wood_decorated = 'stairs_wood_decorated',
  stairs_wood = 'stairs_wood',
  stairs = 'stairs',
  stool = 'stool',
  sword_shield_broken = 'sword_shield_broken',
  sword_shield_gold = 'sword_shield_gold',
  sword_shield = 'sword_shield',
  table_long_broken = 'table_long_broken',
  table_long_decorated_A = 'table_long_decorated_A',
  table_long_decorated_C = 'table_long_decorated_C',
  table_long_tablecloth_decorated_A = 'table_long_tablecloth_decorated_A',
  table_long_tablecloth = 'table_long_tablecloth',
  table_long = 'table_long',
  table_medium_broken = 'table_medium_broken',
  table_medium_decorated_A = 'table_medium_decorated_A',
  table_medium_tablecloth_decorated_B = 'table_medium_tablecloth_decorated_B',
  table_medium_tablecloth = 'table_medium_tablecloth',
  table_medium = 'table_medium',
  table_small_decorated_A = 'table_small_decorated_A',
  table_small_decorated_B = 'table_small_decorated_B',
  table_small = 'table_small',
  torch_lit = 'torch_lit',
  torch_mounted = 'torch_mounted',
  torch = 'torch',
  trunk_large_A = 'trunk_large_A',
  trunk_large_B = 'trunk_large_B',
  trunk_large_C = 'trunk_large_C',
  trunk_medium_A = 'trunk_medium_A',
  trunk_medium_B = 'trunk_medium_B',
  trunk_medium_C = 'trunk_medium_C',
  trunk_small_A = 'trunk_small_A',
  trunk_small_B = 'trunk_small_B',
  trunk_small_C = 'trunk_small_C',
  wall_arched = 'wall_arched',
  wall_archedwindow_gated_scaffold = 'wall_archedwindow_gated_scaffold',
  wall_archedwindow_gated = 'wall_archedwindow_gated',
  wall_archedwindow_open = 'wall_archedwindow_open',
  wall_broken = 'wall_broken',
  wall_corner_gated = 'wall_corner_gated',
  wall_corner_scaffold = 'wall_corner_scaffold',
  wall_corner_small = 'wall_corner_small',
  wall_corner = 'wall_corner',
  wall_cracked = 'wall_cracked',
  wall_crossing = 'wall_crossing',
  wall_doorway_scaffold = 'wall_doorway_scaffold',
  wall_doorway_sides = 'wall_doorway_sides',
  wall_doorway_Tsplit = 'wall_doorway_Tsplit',
  wall_doorway = 'wall_doorway',
  wall_endcap = 'wall_endcap',
  wall_gated = 'wall_gated',
  wall_half_endcap_sloped = 'wall_half_endcap_sloped',
  wall_half_endcap = 'wall_half_endcap',
  wall_half = 'wall_half',
  wall_open_scaffold = 'wall_open_scaffold',
  wall_pillar = 'wall_pillar',
  wall_scaffold = 'wall_scaffold',
  wall_shelves = 'wall_shelves',
  wall_sloped = 'wall_sloped',
  wall_Tsplit_sloped = 'wall_Tsplit_sloped',
  wall_Tsplit = 'wall_Tsplit',
  wall_window_closed_scaffold = 'wall_window_closed_scaffold',
  wall_window_closed = 'wall_window_closed',
  wall_window_open_scaffold = 'wall_window_open_scaffold',
  wall_window_open = 'wall_window_open',
  wall = 'wall',
}
