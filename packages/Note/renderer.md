WebGPURenderer继承自Renderer，创建WebGPUBackend并super(backend)

Renderer的构造函数中，this.backend = backend

## init
（第一次render会先调用init
### 调用await backend.init(this)
这里看到webgpu的流程，获取adapter、device、context
并获取一个colorBuffer

### 设置一些参数
Nodes
Animation
Attributes
Background
Geometries
Textures
Pipelines
Bindings
RenderObjects
RenderLists
RenderContexts

## render
### RenderContexts
  通过renderTarget获取一个renderContext
  是一个对象，保存了类似renderState的信息

- activeCubeFace和activeMipmapLevel默认都是0
- currentRenderObjectFunction取this.renderObject
- scene的onBeforeRender
- renderList
  renderList.begin();
  this._projectObject()
  renderList.finish();
  renderList.sort()
- nodes.updateScene()
- background.update()
- backend.beginRender(renderContext)
- 调用this._renderObjects先opaque后transparent
- backend.finishRender(renderContext)
- 恢复之前的renderId、renderContext、RenderObjectFunction
- scene的onAfterRender