import * as Core from '../packages/src/Three'
import * as Addons from '../packages/examples/jsm/Addons'
import TWEEN from '../packages/thirdparty/tween.esm.js'
import WebGPURenderer from '../packages/examples/jsm/renderers/webgpu/WebGPURenderer.js'
import * as Nodes from '../packages/examples/jsm/nodes/Nodes.js'
import { GUI } from '../packages/examples/jsm/libs/lil-gui.module.min.js'

import * as MikkTSpace from '../packages/examples/jsm/libs/mikktspace.module.js'
import * as FFlate from '../packages/examples/jsm/libs/fflate.module.js'
import { MeshoptDecoder } from '../packages/examples/jsm/libs/meshopt_decoder.module.js'
const extras = {
  TWEEN,
  WebGPURenderer,
  Nodes,
  GUI,
  MikkTSpace,
  FFlate,
  MeshoptDecoder
}
const content = {
  ...Core,
  ...Addons
}

Object.keys(extras).forEach(key => {
  if (!content[key]) {
    content[key] = extras[key]
  } else {
    console.log('重复', key)
  }
})

window.THREE = content
