<template>
  <div class="viewport-container">
    <div id="viewport">
      <ViewportInfo />
      <div
        id="viewHelper"
        @pointerup="helperPointerUp"
        @pointerdown="helperPointerDown">
      </div>
    </div>
    <Toolbar />
    <ViewportControls />
  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
import ViewportInfo from './ViewportInfo.vue'
import Toolbar from '@/components/Viewport/Toolbar.vue'
import ViewportControls from '@/components/Viewport/ViewportControls.vue'
import { EditorControls } from './Viewport/EditorControls.js'
import { SetPositionCommand } from '@/editor/commands/SetPositionCommand.js'
import { SetRotationCommand } from '@/editor/commands/SetRotationCommand.js'
import { SetScaleCommand } from '@/editor/commands/SetScaleCommand.js'
import { useMainStore } from '@/store'
const store = useMainStore()

const { RoomEnvironment, TransformControls } = THREE

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      init()
    }
  }, {
    immediate: true
  })
})
let viewHelper = null
function helperPointerUp (e) {
  e.stopPropagation()
  if (viewHelper) {
    viewHelper.handleClick(e)
  }
}
function helperPointerDown (e) {
  e.stopPropagation()
}

function init () {
  const editor = window.editor
  const { selector, signals, camera, scene, sceneHelpers } = editor
  const container = document.querySelector('#viewport')
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.setClearColor(0xaaaaaa)

  const grid = new THREE.Group()

  const grid1 = new THREE.GridHelper(300, 300, 0x4C4C4C)
  grid1.material.color.setHex(0x4C4C4C)
  grid1.material.vertexColors = false
  grid.add(grid1)

  viewHelper = new THREE.ViewHelper(camera, container)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.offsetWidth, container.offsetHeight)

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  container.appendChild(renderer.domElement)

  scene.traverse(function (child) {
    if (child.material !== undefined) {
      child.material.needsUpdate = true
    }
  })

  let prevActionsInUse = 0

  const clock = new THREE.Clock() // only used for animations
  let startTime = 0
  let endTime = 0
  function animate () {
    const mixer = editor.mixer
    const delta = clock.getDelta()

    let needsUpdate = false

    // Animations

    const actions = mixer.stats.actions

    if (actions.inUse > 0 || prevActionsInUse > 0) {
      prevActionsInUse = actions.inUse

      mixer.update(delta)
      needsUpdate = true

      if (editor.selected !== null) {
        editor.selected.updateWorldMatrix(false, true) // avoid frame late effect for certain skinned meshes (e.g. Michelle.glb)
        selectionBox.box.setFromObject(editor.selected, true) // selection box should reflect current animation state
      }
    }

    // View Helper

    if (viewHelper.animating === true) {
      viewHelper.update(delta)
      needsUpdate = true
    }

    if (renderer.xr.isPresenting === true) {
      needsUpdate = true
    }

    if (needsUpdate === true) render()
  }
  renderer.setAnimationLoop(animate)
  render()

  const box = new THREE.Box3()

  const selectionBox = new THREE.Box3Helper(box)
  selectionBox.material.depthTest = false
  selectionBox.material.transparent = true
  selectionBox.visible = false
  sceneHelpers.add(selectionBox)

  let objectPositionOnDown = null
  let objectRotationOnDown = null
  let objectScaleOnDown = null

  const transformControls = new TransformControls(camera, container)
  transformControls.addEventListener('axis-changed', function () {
    render()
  })
  transformControls.addEventListener('objectChange', function () {
    signals.objectChanged.dispatch(transformControls.object)
  })
  transformControls.addEventListener('mouseDown', function () {
    const object = transformControls.object

    objectPositionOnDown = object.position.clone()
    objectRotationOnDown = object.rotation.clone()
    objectScaleOnDown = object.scale.clone()

    controls.enabled = false
  })
  transformControls.addEventListener('mouseUp', function () {
    const object = transformControls.object

    if (object !== undefined) {
      switch (transformControls.getMode()) {
        case 'translate':

          if (!objectPositionOnDown.equals(object.position)) {
            editor.execute(new SetPositionCommand(editor, object, object.position, objectPositionOnDown))
          }

          break

        case 'rotate':

          if (!objectRotationOnDown.equals(object.rotation)) {
            editor.execute(new SetRotationCommand(editor, object, object.rotation, objectRotationOnDown))
          }

          break

        case 'scale':

          if (!objectScaleOnDown.equals(object.scale)) {
            editor.execute(new SetScaleCommand(editor, object, object.scale, objectScaleOnDown))
          }

          break
      }
    }

    controls.enabled = true
  })

  sceneHelpers.add(transformControls)

  // events

  function updateAspectRatio () {
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  }

  const onDownPosition = new THREE.Vector2()
  const onUpPosition = new THREE.Vector2()
  const onDoubleClickPosition = new THREE.Vector2()

  function getMousePosition (dom, x, y) {
    const rect = dom.getBoundingClientRect()
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height]
  }

  function handleClick () {
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      const intersects = selector.getPointerIntersects(onUpPosition, camera)
      signals.intersectionsDetected.dispatch(intersects)

      render()
    }
  }

  function onMouseDown (event) {
    // event.preventDefault();

    if (event.target !== renderer.domElement) return

    const array = getMousePosition(container, event.clientX, event.clientY)
    onDownPosition.fromArray(array)

    document.addEventListener('mouseup', onMouseUp)
  }

  function onMouseUp (event) {
    const array = getMousePosition(container, event.clientX, event.clientY)
    onUpPosition.fromArray(array)

    handleClick()

    document.removeEventListener('mouseup', onMouseUp)
  }

  function onTouchStart (event) {
    const touch = event.changedTouches[0]

    const array = getMousePosition(container, touch.clientX, touch.clientY)
    onDownPosition.fromArray(array)

    document.addEventListener('touchend', onTouchEnd)
  }

  function onTouchEnd (event) {
    const touch = event.changedTouches[0]

    const array = getMousePosition(container, touch.clientX, touch.clientY)
    onUpPosition.fromArray(array)

    handleClick()

    document.removeEventListener('touchend', onTouchEnd)
  }

  function onDoubleClick (event) {
    const array = getMousePosition(container, event.clientX, event.clientY)
    onDoubleClickPosition.fromArray(array)

    const intersects = selector.getPointerIntersects(onDoubleClickPosition, camera)

    if (intersects.length > 0) {
      const intersect = intersects[0]

      signals.objectFocused.dispatch(intersect.object)
    }
  }

  container.addEventListener('mousedown', onMouseDown)
  container.addEventListener('touchstart', onTouchStart, { passive: false })
  container.addEventListener('dblclick', onDoubleClick)

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.

  const controls = new EditorControls(camera, container)
  controls.addEventListener('change', function () {
    signals.cameraChanged.dispatch(camera)
    signals.refreshSidebarObject3D.dispatch(camera)
  })
  viewHelper.center = controls.center

  // signals

  signals.editorCleared.add(function () {
    controls.center.set(0, 0, 0)

    render()
  })

  signals.transformModeChanged.add(function (mode) {
    transformControls.setMode(mode)

    render()
  })

  signals.spaceChanged.add(function (space) {
    transformControls.setSpace(space)
  })

  signals.rendererDetectKTX2Support.add(function (ktx2Loader) {
    ktx2Loader.detectSupport(renderer)
  })

  signals.sceneGraphChanged.add(function () {
    render()
  })

  signals.cameraChanged.add(function () {
    render()
  })

  signals.objectSelected.add(function (object) {
    selectionBox.visible = false
    transformControls.detach()

    if (object !== null && object !== scene && object !== camera) {
      box.setFromObject(object, true)

      if (box.isEmpty() === false) {
        selectionBox.visible = true
      }

      transformControls.attach(object)
    }

    render()
  })

  signals.objectFocused.add(function (object) {
    controls.focus(object)
  })

  signals.geometryChanged.add(function (object) {
    if (object !== undefined) {
      box.setFromObject(object, true)
    }

    render()
  })

  signals.objectChanged.add(function (object) {
    if (editor.selected === object) {
      box.setFromObject(object, true)
    }

    if (object.isPerspectiveCamera) {
      object.updateProjectionMatrix()
    }

    const helper = editor.helpers[object.id]

    if (helper !== undefined && helper.isSkeletonHelper !== true) {
      helper.update()
    }

    render()
  })

  signals.objectRemoved.add(function (object) {
    controls.enabled = true // see #14180

    if (object === transformControls.object) {
      transformControls.detach()
    }
  })

  signals.materialChanged.add(function () {
    render()
  })

  // background

  signals.sceneBackgroundChanged.add(function (backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture, backgroundBlurriness, backgroundIntensity, backgroundRotation) {
    scene.background = null

    switch (backgroundType) {
      case 'Color':

        scene.background = new THREE.Color(backgroundColor)

        break

      case 'Texture':

        if (backgroundTexture) {
          scene.background = backgroundTexture
        }

        break

      case 'Equirectangular':

        if (backgroundEquirectangularTexture) {
          backgroundEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping

          scene.background = backgroundEquirectangularTexture
          scene.backgroundBlurriness = backgroundBlurriness
          scene.backgroundIntensity = backgroundIntensity
          scene.backgroundRotation.y = backgroundRotation * THREE.MathUtils.DEG2RAD

          if (useBackgroundAsEnvironment) {
            scene.environment = scene.background
            scene.environmentRotation.y = backgroundRotation * THREE.MathUtils.DEG2RAD
          }
        }

        break
    }

    render()
  })

  // environment

  let useBackgroundAsEnvironment = false

  signals.sceneEnvironmentChanged.add(function (environmentType, environmentEquirectangularTexture) {
    scene.environment = null

    useBackgroundAsEnvironment = false

    switch (environmentType) {
      case 'Background':

        useBackgroundAsEnvironment = true

        scene.environment = scene.background
        scene.environment.mapping = THREE.EquirectangularReflectionMapping
        scene.environmentRotation.y = scene.backgroundRotation.y

        break

      case 'Equirectangular':

        if (environmentEquirectangularTexture) {
          scene.environment = environmentEquirectangularTexture
          scene.environment.mapping = THREE.EquirectangularReflectionMapping
        }

        break

      case 'ModelViewer':

        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

        break
    }

    render()
  })

  // fog

  signals.sceneFogChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {
    switch (fogType) {
      case 'None':
        scene.fog = null
        break
      case 'Fog':
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar)
        break
      case 'FogExp2':
        scene.fog = new THREE.FogExp2(fogColor, fogDensity)
        break
    }

    render()
  })

  signals.sceneFogSettingsChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {
    switch (fogType) {
      case 'Fog':
        scene.fog.color.setHex(fogColor)
        scene.fog.near = fogNear
        scene.fog.far = fogFar
        break
      case 'FogExp2':
        scene.fog.color.setHex(fogColor)
        scene.fog.density = fogDensity
        break
    }

    render()
  })

  signals.viewportShadingChanged.add(function () {
    const viewportShading = editor.viewportShading

    switch (viewportShading) {
      case 'solid':
        scene.overrideMaterial = null
        break

      case 'wireframe':
        scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
        break
    }

    render()
  })

  //

  signals.windowResize.add(function () {
    updateAspectRatio()

    renderer.setSize(container.offsetWidth, container.offsetHeight)

    render()
  })

  signals.showGridChanged.add(function (value) {
    grid.visible = value

    render()
  })

  signals.showHelpersChanged.add(function (value) {
    sceneHelpers.visible = value
    transformControls.enabled = value

    render()
  })

  signals.cameraResetted.add(updateAspectRatio)

  function render () {
    startTime = performance.now()

    renderer.setViewport(0, 0, container.offsetWidth, container.offsetHeight)
    renderer.render(scene, editor.viewportCamera)

    if (camera === editor.viewportCamera) {
      renderer.autoClear = false
      if (grid.visible === true) renderer.render(grid, camera)
      if (sceneHelpers.visible === true) renderer.render(sceneHelpers, camera)
      viewHelper.render(renderer)
      renderer.autoClear = true
    }

    endTime = performance.now()
    editor.signals.sceneRendered.dispatch(endTime - startTime)
  }
}

</script>
<style lang="less">
.viewport-container {
  position: absolute;
  top: 32px;
  left: 0;
  right: 350px;
  bottom: 0;
  #viewport {
    width: 100%; height: 100%;
    #viewHelper {
      position: absolute; right: 0; bottom: 0;
      width: 128px; height: 128px;
    }
  }
}
</style>
