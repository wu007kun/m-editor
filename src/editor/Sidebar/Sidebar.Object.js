import { UIPanel, UIRow, UICheckbox, UIText, UINumber } from '../libs/ui.js'
import { SetValueCommand } from '../commands/SetValueCommand.js'
import { SetPositionCommand } from '../commands/SetPositionCommand.js'
import { SetRotationCommand } from '../commands/SetRotationCommand.js'
import { SetScaleCommand } from '../commands/SetScaleCommand.js'

function SidebarObject (editor) {
  const strings = editor.strings

  const signals = editor.signals

  const container = new UIPanel()
  container.setBorderTop('0')
  container.setPaddingTop('20px')
  container.setDisplay('none')

  // position

  const objectPositionRow = new UIRow()
  const objectPositionX = new UINumber().setPrecision(3).setWidth('50px').onChange(update)
  const objectPositionY = new UINumber().setPrecision(3).setWidth('50px').onChange(update)
  const objectPositionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update)

  objectPositionRow.add(new UIText(strings.getKey('sidebar/object/position')).setClass('Label'))
  objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ)

  container.add(objectPositionRow)

  // rotation

  const objectRotationRow = new UIRow()
  const objectRotationX = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update)
  const objectRotationY = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update)
  const objectRotationZ = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update)

  objectRotationRow.add(new UIText(strings.getKey('sidebar/object/rotation')).setClass('Label'))
  objectRotationRow.add(objectRotationX, objectRotationY, objectRotationZ)

  container.add(objectRotationRow)

  // scale

  const objectScaleRow = new UIRow()
  const objectScaleX = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update)
  const objectScaleY = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update)
  const objectScaleZ = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update)

  objectScaleRow.add(new UIText(strings.getKey('sidebar/object/scale')).setClass('Label'))
  objectScaleRow.add(objectScaleX, objectScaleY, objectScaleZ)

  container.add(objectScaleRow)

  // visible

  const objectVisibleRow = new UIRow()
  const objectVisible = new UICheckbox().onChange(update)

  objectVisibleRow.add(new UIText(strings.getKey('sidebar/object/visible')).setClass('Label'))
  objectVisibleRow.add(objectVisible)

  container.add(objectVisibleRow)

  function update () {
    const object = editor.selected

    if (object !== null) {
      const newPosition = new THREE.Vector3(objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue())
      if (object.position.distanceTo(newPosition) >= 0.01) {
        editor.execute(new SetPositionCommand(editor, object, newPosition))
      }

      const newRotation = new THREE.Euler(objectRotationX.getValue() * THREE.MathUtils.DEG2RAD, objectRotationY.getValue() * THREE.MathUtils.DEG2RAD, objectRotationZ.getValue() * THREE.MathUtils.DEG2RAD)
      if (new THREE.Vector3().setFromEuler(object.rotation).distanceTo(new THREE.Vector3().setFromEuler(newRotation)) >= 0.01) {
        editor.execute(new SetRotationCommand(editor, object, newRotation))
      }

      const newScale = new THREE.Vector3(objectScaleX.getValue(), objectScaleY.getValue(), objectScaleZ.getValue())
      if (object.scale.distanceTo(newScale) >= 0.01) {
        editor.execute(new SetScaleCommand(editor, object, newScale))
      }

      if (object.visible !== objectVisible.getValue()) {
        editor.execute(new SetValueCommand(editor, object, 'visible', objectVisible.getValue()))
      }
    }
  }

  function updateTransformRows (object) {
    if (object.isLight ||
      (object.isObject3D && object.userData.targetInverse)) {
      objectRotationRow.setDisplay('none')
      objectScaleRow.setDisplay('none')
    } else {
      objectRotationRow.setDisplay('')
      objectScaleRow.setDisplay('')
    }
  }

  // events

  signals.objectSelected.add(function (object) {
    if (object !== null) {
      container.setDisplay('block')
      updateUI(object)
    } else {
      container.setDisplay('none')
    }
  })

  signals.objectChanged.add(function (object) {
    if (object !== editor.selected) return

    updateUI(object)
  })

  signals.refreshSidebarObject3D.add(function (object) {
    if (object !== editor.selected) return

    updateUI(object)
  })

  function updateUI (object) {
    objectPositionX.setValue(object.position.x)
    objectPositionY.setValue(object.position.y)
    objectPositionZ.setValue(object.position.z)
    objectRotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG)
    objectRotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG)
    objectRotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG)
    objectScaleX.setValue(object.scale.x)
    objectScaleY.setValue(object.scale.y)
    objectScaleZ.setValue(object.scale.z)
    objectVisible.setValue(object.visible)
    updateTransformRows(object)
  }

  return container
}

export { SidebarObject }
