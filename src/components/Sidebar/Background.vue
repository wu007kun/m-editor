<template>
  <div ref="container"></div>
</template>
<script setup>
import { UIRow, UIColor, UISelect, UIText, UINumber } from '@/editor/libs/ui.js'
import { UITexture } from '@/editor/libs/ui.three.js'
import { onMounted, ref, watch } from 'vue'
const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
const containerRef = ref()
let editor = null
const backgroundType = new UISelect().setOptions({
  None: '',
  Color: 'Color',
  Texture: 'Texture',
  Equirectangular: 'Equirect'
}).setWidth('150px')

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const container = containerRef.value
      editor = window.editor
      const backgroundRow = new UIRow()
      backgroundType.onChange(function () {
        onBackgroundChanged()
        refreshBackgroundUI()
      })

      backgroundRow.add(new UIText('背景色').setClass('Label'))
      backgroundRow.add(backgroundType)

      const backgroundColor = new UIColor().setValue('#000000').setMarginLeft('8px').onInput(onBackgroundChanged)
      backgroundRow.add(backgroundColor)

      const backgroundTexture = new UITexture(editor).setMarginLeft('8px').onChange(onBackgroundChanged)
      backgroundTexture.setDisplay('none')
      backgroundRow.add(backgroundTexture)

      const backgroundEquirectangularTexture = new UITexture(editor).setMarginLeft('8px').onChange(onBackgroundChanged)
      backgroundEquirectangularTexture.setDisplay('none')
      backgroundRow.add(backgroundEquirectangularTexture)

      container.add(backgroundRow)

      const backgroundEquirectRow = new UIRow()
      backgroundEquirectRow.setDisplay('none')
      backgroundEquirectRow.setMarginLeft('120px')

      const backgroundBlurriness = new UINumber(0).setWidth('40px').setRange(0, 1).onChange(onBackgroundChanged)
      backgroundEquirectRow.add(backgroundBlurriness)

      const backgroundIntensity = new UINumber(1).setWidth('40px').setRange(0, Infinity).onChange(onBackgroundChanged)
      backgroundEquirectRow.add(backgroundIntensity)

      const backgroundRotation = new UINumber(0).setWidth('40px').setRange(-180, 180).setStep(10).setNudge(0.1).setUnit('°').onChange(onBackgroundChanged)
      backgroundEquirectRow.add(backgroundRotation)

      container.add(backgroundEquirectRow)

      function onBackgroundChanged () {
        signals.sceneBackgroundChanged.dispatch(
          backgroundType.getValue(),
          backgroundColor.getHexValue(),
          backgroundTexture.getValue(),
          backgroundEquirectangularTexture.getValue(),
          backgroundBlurriness.getValue(),
          backgroundIntensity.getValue(),
          backgroundRotation.getValue()
        )
      }

      function refreshBackgroundUI () {
        const type = backgroundType.getValue()

        backgroundType.setWidth(type === 'None' ? '150px' : '110px')
        backgroundColor.setDisplay(type === 'Color' ? '' : 'none')
        backgroundTexture.setDisplay(type === 'Texture' ? '' : 'none')
        backgroundEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none')
        backgroundEquirectRow.setDisplay(type === 'Equirectangular' ? '' : 'none')
      }

      // environment

      const environmentRow = new UIRow()

      const environmentType = new UISelect().setOptions({

        None: '',
        Background: 'Background',
        Equirectangular: 'Equirect',
        ModelViewer: 'ModelViewer'

      }).setWidth('150px')
      environmentType.setValue('None')
      environmentType.onChange(function () {
        onEnvironmentChanged()
        refreshEnvironmentUI()
      })

      environmentRow.add(new UIText('环境').setClass('Label'))
      environmentRow.add(environmentType)

      const environmentEquirectangularTexture = new UITexture(editor).setMarginLeft('8px').onChange(onEnvironmentChanged)
      environmentEquirectangularTexture.setDisplay('none')
      environmentRow.add(environmentEquirectangularTexture)

      container.add(environmentRow)

      function onEnvironmentChanged () {
        signals.sceneEnvironmentChanged.dispatch(
          environmentType.getValue(),
          environmentEquirectangularTexture.getValue()
        )
      }

      function refreshEnvironmentUI () {
        const type = environmentType.getValue()

        environmentType.setWidth(type !== 'Equirectangular' ? '150px' : '110px')
        environmentEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none')
      }

      // fog

      function onFogChanged () {
        signals.sceneFogChanged.dispatch(
          fogType.getValue(),
          fogColor.getHexValue(),
          fogNear.getValue(),
          fogFar.getValue(),
          fogDensity.getValue()
        )
      }

      function onFogSettingsChanged () {
        signals.sceneFogSettingsChanged.dispatch(
          fogType.getValue(),
          fogColor.getHexValue(),
          fogNear.getValue(),
          fogFar.getValue(),
          fogDensity.getValue()
        )
      }

      const fogTypeRow = new UIRow()
      const fogType = new UISelect().setOptions({

        None: '',
        Fog: 'Linear',
        FogExp2: 'Exponential'

      }).setWidth('150px')
      fogType.onChange(function () {
        onFogChanged()
        refreshFogUI()
      })

      fogTypeRow.add(new UIText('雾效').setClass('Label'))
      fogTypeRow.add(fogType)

      container.add(fogTypeRow)

      // fog color

      const fogPropertiesRow = new UIRow()
      fogPropertiesRow.setDisplay('none')
      fogPropertiesRow.setMarginLeft('120px')
      container.add(fogPropertiesRow)

      const fogColor = new UIColor().setValue('#aaaaaa')
      fogColor.onInput(onFogSettingsChanged)
      fogPropertiesRow.add(fogColor)

      // fog near

      const fogNear = new UINumber(0.1).setWidth('40px').setRange(0, Infinity).onChange(onFogSettingsChanged)
      fogPropertiesRow.add(fogNear)

      // fog far

      const fogFar = new UINumber(50).setWidth('40px').setRange(0, Infinity).onChange(onFogSettingsChanged)
      fogPropertiesRow.add(fogFar)

      // fog density

      const fogDensity = new UINumber(0.05).setWidth('40px').setRange(0, 0.1).setStep(0.001).setPrecision(3).onChange(onFogSettingsChanged)
      fogPropertiesRow.add(fogDensity)

      function refreshFogUI () {
        const type = fogType.getValue()

        fogPropertiesRow.setDisplay(type === 'None' ? 'none' : '')
        fogNear.setDisplay(type === 'Fog' ? '' : 'none')
        fogFar.setDisplay(type === 'Fog' ? '' : 'none')
        fogDensity.setDisplay(type === 'FogExp2' ? '' : 'none')
      }
    }
  })
})

function refreshUI () {
  const scene = editor.scene
  if (scene.background) {
    if (scene.background.isColor) {
      backgroundType.setValue('Color')
      backgroundColor.setHexValue(scene.background.getHex())
    } else if (scene.background.isTexture) {
      if (scene.background.mapping === THREE.EquirectangularReflectionMapping) {
        backgroundType.setValue('Equirectangular')
        backgroundEquirectangularTexture.setValue(scene.background)
        backgroundBlurriness.setValue(scene.backgroundBlurriness)
        backgroundIntensity.setValue(scene.backgroundIntensity)
      } else {
        backgroundType.setValue('Texture')
        backgroundTexture.setValue(scene.background)
      }
    }
  } else {
    backgroundType.setValue('None')
  }

  if (scene.environment) {
    if (scene.environment.mapping === THREE.EquirectangularReflectionMapping) {
      environmentType.setValue('Equirectangular')
      environmentEquirectangularTexture.setValue(scene.environment)
    } else if (scene.environment.isRenderTargetTexture === true) {
      environmentType.setValue('ModelViewer')
    }
  } else {
    environmentType.setValue('None')
  }

  if (scene.fog) {
    fogColor.setHexValue(scene.fog.color.getHex())

    if (scene.fog.isFog) {
      fogType.setValue('Fog')
      fogNear.setValue(scene.fog.near)
      fogFar.setValue(scene.fog.far)
    } else if (scene.fog.isFogExp2) {
      fogType.setValue('FogExp2')
      fogDensity.setValue(scene.fog.density)
    }
  } else {
    fogType.setValue('None')
  }

  refreshBackgroundUI()
  refreshEnvironmentUI()
  refreshFogUI()
}

</script>
