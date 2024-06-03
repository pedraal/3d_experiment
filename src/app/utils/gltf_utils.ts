import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

// biome-ignore lint/complexity/noStaticOnlyClass: Because why not
export class GLTFUtils {
  static cloneGltf(gltf: GLTF) {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true),
    }

    const skinnedMeshes = {}

    gltf.scene.traverse((node) => {
      if (node instanceof THREE.SkinnedMesh) skinnedMeshes[node.name] = node
    })

    const cloneBones: Record<string, THREE.Bone> = {}
    const cloneSkinnedMeshes: Record<string, THREE.SkinnedMesh> = {}

    clone.scene.traverse((node) => {
      if (node instanceof THREE.Bone) cloneBones[node.name] = node

      if (node instanceof THREE.SkinnedMesh) cloneSkinnedMeshes[node.name] = node
    })

    for (const name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name]
      const skeleton = skinnedMesh.skeleton
      const cloneSkinnedMesh = cloneSkinnedMeshes[name]

      const orderedCloneBones: THREE.Bone[] = []

      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }

      cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses), cloneSkinnedMesh.matrixWorld)
    }

    return clone
  }
}
