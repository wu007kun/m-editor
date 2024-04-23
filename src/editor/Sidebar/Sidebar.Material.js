import { UIInput, UIDiv, UIText } from '../libs/ui.js'
import { SetMaterialValueCommand } from '../commands/SetMaterialValueCommand.js'
import { SidebarMaterialBooleanProperty } from './Sidebar.Material.BooleanProperty.js'
import { SidebarMaterialColorProperty } from './Sidebar.Material.ColorProperty.js'
import { SidebarMaterialMapProperty } from './Sidebar.Material.MapProperty.js'
import { SidebarMaterialNumberProperty } from './Sidebar.Material.NumberProperty.js'

function SidebarMaterial (editor) {
  const signals = editor.signals
  const strings = editor.strings

  let currentObject

  let currentMaterialSlot = 0

  const container = new UIDiv()
  container.setDisplay('none')
  container.setClass('detail-form')

  const basicGroup = new UIDiv('detail-form-group')
  // name
  const materialNameRow = new UIDiv('detail-form-item')
  const materialName = new UIInput().onChange(function () {
    editor.execute(new SetMaterialValueCommand(editor, editor.selected, 'name', materialName.getValue(), currentMaterialSlot))
  })
  materialNameRow.add(new UIText(strings.getKey('sidebar/material/name')).setClass('label'))
  materialNameRow.add(materialName)
  basicGroup.add(materialNameRow)
  // color
  const materialColor = new SidebarMaterialColorProperty(editor, 'color', strings.getKey('sidebar/material/color'))
  basicGroup.add(materialColor)
  // emissive
  const materialEmissive = new SidebarMaterialColorProperty(editor, 'emissive', strings.getKey('sidebar/material/emissive'))
  basicGroup.add(materialEmissive)
  // roughness
  const materialRoughness = new SidebarMaterialNumberProperty(editor, 'roughness', strings.getKey('sidebar/material/roughness'), [0, 1])
  basicGroup.add(materialRoughness)
  // metalness
  const materialMetalness = new SidebarMaterialNumberProperty(editor, 'metalness', strings.getKey('sidebar/material/metalness'), [0, 1])
  basicGroup.add(materialMetalness)
  container.add(basicGroup)

  const mapGroup = new UIDiv('detail-form-group')
  // map
  const materialMap = new SidebarMaterialMapProperty(editor, 'map', strings.getKey('sidebar/material/map'))
  mapGroup.add(materialMap)
  // emissive map
  const materialEmissiveMap = new SidebarMaterialMapProperty(editor, 'emissiveMap', strings.getKey('sidebar/material/emissivemap'))
  mapGroup.add(materialEmissiveMap)
  // alpha map
  const materialAlphaMap = new SidebarMaterialMapProperty(editor, 'alphaMap', strings.getKey('sidebar/material/alphamap'))
  mapGroup.add(materialAlphaMap)
  // bump map
  const materialBumpMap = new SidebarMaterialMapProperty(editor, 'bumpMap', strings.getKey('sidebar/material/bumpmap'))
  mapGroup.add(materialBumpMap)
  // normal map
  const materialNormalMap = new SidebarMaterialMapProperty(editor, 'normalMap', strings.getKey('sidebar/material/normalmap'))
  mapGroup.add(materialNormalMap)
  // displacement map
  const materialDisplacementMap = new SidebarMaterialMapProperty(editor, 'displacementMap', strings.getKey('sidebar/material/displacementmap'))
  mapGroup.add(materialDisplacementMap)
  // roughness map
  const materialRoughnessMap = new SidebarMaterialMapProperty(editor, 'roughnessMap', strings.getKey('sidebar/material/roughnessmap'))
  mapGroup.add(materialRoughnessMap)
  // metalness map
  const materialMetalnessMap = new SidebarMaterialMapProperty(editor, 'metalnessMap', strings.getKey('sidebar/material/metalnessmap'))
  mapGroup.add(materialMetalnessMap)
  // env map
  const materialEnvMap = new SidebarMaterialMapProperty(editor, 'envMap', strings.getKey('sidebar/material/envmap'))
  mapGroup.add(materialEnvMap)
  // light map
  const materialLightMap = new SidebarMaterialMapProperty(editor, 'lightMap', strings.getKey('sidebar/material/lightmap'))
  mapGroup.add(materialLightMap)
  // ambient occlusion map
  const materialAOMap = new SidebarMaterialMapProperty(editor, 'aoMap', strings.getKey('sidebar/material/aomap'))
  mapGroup.add(materialAOMap)
  container.add(mapGroup)

  const alphaGroup = new UIDiv('detail-form-group')
  // opacity
  const materialOpacity = new SidebarMaterialNumberProperty(editor, 'opacity', strings.getKey('sidebar/material/opacity'), [0, 1])
  alphaGroup.add(materialOpacity)
  // transparent
  const materialTransparent = new SidebarMaterialBooleanProperty(editor, 'transparent', strings.getKey('sidebar/material/transparent'))
  alphaGroup.add(materialTransparent)
  // wireframe
  const materialWireframe = new SidebarMaterialBooleanProperty(editor, 'wireframe', strings.getKey('sidebar/material/wireframe'))
  alphaGroup.add(materialWireframe)
  container.add(alphaGroup)

  function refreshUI () {
    if (!currentObject) return

    let material = currentObject.material

    if (Array.isArray(material)) {
      const slotOptions = {}

      currentMaterialSlot = Math.max(0, Math.min(material.length, currentMaterialSlot))

      for (let i = 0; i < material.length; i++) {
        slotOptions[i] = String(i + 1) + ': ' + material[i].name
      }
    }

    material = editor.getObjectMaterial(currentObject, currentMaterialSlot)

    if (material.name !== undefined) {
      materialName.setValue(material.name)
    }
  }

  // events

  signals.objectSelected.add(function (object) {
    let hasMaterial = false

    if (object && object.material) {
      hasMaterial = true

      if (Array.isArray(object.material) && object.material.length === 0) {
        hasMaterial = false
      }
    }

    if (hasMaterial) {
      currentObject = object
      refreshUI()
      container.setDisplay('')
    } else {
      currentObject = null
      container.setDisplay('none')
    }
  })

  signals.materialChanged.add(refreshUI)

  return container
}

export { SidebarMaterial }
