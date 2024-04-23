import { UICheckbox, UIDiv, UINumber, UIText } from '../libs/ui.js'
import { UITexture } from '../libs/ui.three.js'
import { SetMaterialMapCommand } from '../commands/SetMaterialMapCommand.js'
import { SetMaterialValueCommand } from '../commands/SetMaterialValueCommand.js'
import { SetMaterialVectorCommand } from '../commands/SetMaterialVectorCommand.js'

function SidebarMaterialMapProperty (editor, property, name) {
  const signals = editor.signals

  const container = new UIDiv('detail-form-item')
  container.add(new UIText(name).setClass('label'))

  const enabled = new UICheckbox(false).setMarginRight('8px').onChange(onChange)
  container.add(enabled)

  const map = new UITexture(editor).onChange(onMapChange)
  container.add(map)

  const mapType = property.replace('Map', '')

  const colorMaps = ['map', 'emissiveMap', 'sheenColorMap', 'specularColorMap', 'envMap']

  let intensity

  if (property === 'aoMap') {
    intensity = new UINumber(1).setClass('number-input').setWidth('40px').setMarginRight('4px').setRange(0, 1).onChange(onIntensityChange)
    container.add(intensity)
  }

  let scale

  if (property === 'bumpMap' || property === 'displacementMap') {
    scale = new UINumber().setClass('number-input').setWidth('40px').setMarginRight('4px').onChange(onScaleChange)
    container.add(scale)
  }

  let scaleX, scaleY

  if (property === 'normalMap' || property === 'clearcoatNormalMap') {
    scaleX = new UINumber().setClass('number-input').setWidth('40px').setMarginRight('4px').onChange(onScaleXYChange)
    container.add(scaleX)

    scaleY = new UINumber().setClass('number-input').setWidth('40px').setMarginRight('4px').onChange(onScaleXYChange)
    container.add(scaleY)
  }

  let rangeMin, rangeMax

  let object = null
  let materialSlot = null
  let material = null

  function onChange () {
    const newMap = enabled.getValue() ? map.getValue() : null

    if (material[property] !== newMap) {
      if (newMap !== null) {
        const geometry = object.geometry

        if (geometry.hasAttribute('uv') === false) console.warn('Geometry doesn\'t have uvs:', geometry)

        if (property === 'envMap') newMap.mapping = THREE.EquirectangularReflectionMapping
      }

      editor.execute(new SetMaterialMapCommand(editor, object, property, newMap, materialSlot))
    }
  }

  function onMapChange (texture) {
    if (texture !== null) {
      if (colorMaps.includes(property) && texture.isDataTexture !== true && texture.colorSpace !== THREE.SRGBColorSpace) {
        texture.colorSpace = THREE.SRGBColorSpace
        material.needsUpdate = true
      }
    }

    enabled.setDisabled(false)

    onChange()
  }

  function onIntensityChange () {
    if (material[`${property}Intensity`] !== intensity.getValue()) {
      editor.execute(new SetMaterialValueCommand(editor, object, `${property}Intensity`, intensity.getValue(), materialSlot))
    }
  }

  function onScaleChange () {
    if (material[`${mapType}Scale`] !== scale.getValue()) {
      editor.execute(new SetMaterialValueCommand(editor, object, `${mapType}Scale`, scale.getValue(), materialSlot))
    }
  }

  function onScaleXYChange () {
    const value = [scaleX.getValue(), scaleY.getValue()]

    if (material[`${mapType}Scale`].x !== value[0] || material[`${mapType}Scale`].y !== value[1]) {
      editor.execute(new SetMaterialVectorCommand(editor, object, `${mapType}Scale`, value, materialSlot))
    }
  }

  function update (currentObject, currentMaterialSlot = 0) {
    object = currentObject
    materialSlot = currentMaterialSlot

    if (object === null) return
    if (object.material === undefined) return

    material = editor.getObjectMaterial(object, materialSlot)

    if (property in material) {
      if (material[property] !== null) {
        map.setValue(material[property])
      }

      enabled.setValue(material[property] !== null)
      enabled.setDisabled(map.getValue() === null)

      if (intensity !== undefined) {
        intensity.setValue(material[`${property}Intensity`])
      }

      if (scale !== undefined) {
        scale.setValue(material[`${mapType}Scale`])
      }

      if (scaleX !== undefined) {
        scaleX.setValue(material[`${mapType}Scale`].x)
        scaleY.setValue(material[`${mapType}Scale`].y)
      }

      if (rangeMin !== undefined) {
        rangeMin.setValue(material[`${mapType}Range`][0])
        rangeMax.setValue(material[`${mapType}Range`][1])
      }

      container.setDisplay('')
    } else {
      container.setDisplay('none')
    }
  }

  //

  signals.objectSelected.add(function (selected) {
    map.setValue(null)

    update(selected)
  })

  signals.materialChanged.add(update)

  return container
}

export { SidebarMaterialMapProperty }
