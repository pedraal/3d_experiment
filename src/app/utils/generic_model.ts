import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFUtils } from './gltf_utils'

interface Params {
  name: string
  position: { x: number; y: number; z: number }
  orientation?: number
}

export class GenericModel {
  name: Params['name']
  model: GLTF

  constructor(params: Params) {
    this.name = params.name

    this.model = GLTFUtils.cloneGltf(GenericModel.gltfs[this.name]) as GLTF
  }

  static gltfs: Record<string, GLTF> = {}
  static loader = new GLTFLoader()
  static async load(directory: string, extension: 'gltf' | 'glb', models: string[]) {
    const loadPromise = (name: string): Promise<void> =>
      new Promise((resolve) => {
        GenericModel.loader.load(
          `/gltf/${directory}/${name}.${extension}`,
          (model) => {
            GenericModel.gltfs[name] = model
            resolve()
          },
          (xhr) => {
            // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
          },
          (error) => {
            console.error('GLTFLoader : ', error)
          },
        )
      })

    await Promise.all(models.map((name) => loadPromise(name)))
  }
}
