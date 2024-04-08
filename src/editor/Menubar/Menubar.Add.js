import { UIPanel, UIRow } from '../libs/ui.js'

import { AddObjectCommand } from '../commands/AddObjectCommand.js'

function MenubarAdd (editor) {
  const strings = editor.strings

  const container = new UIPanel()
  container.setClass('menu')

  const title = new UIPanel()
  title.setClass('title')
  title.setTextContent(strings.getKey('menubar/add'))
  container.add(title)

  const options = new UIPanel()
  options.setClass('options')
  container.add(options)

  let option = new UIRow()

  // AmbientLight
  option.setClass('option')
  option.setTextContent(strings.getKey('menubar/add/ambientlight'))
  option.onClick(function () {
    const color = 0x222222

    const light = new THREE.AmbientLight(color)
    light.name = 'AmbientLight'

    editor.execute(new AddObjectCommand(editor, light))
  })
  options.add(option)

  // DirectionalLight

  option = new UIRow()
  option.setClass('option')
  option.setTextContent(strings.getKey('menubar/add/directionallight'))
  option.onClick(function () {
    const color = 0xffffff
    const intensity = 1

    const light = new THREE.DirectionalLight(color, intensity)
    light.name = 'DirectionalLight'
    light.target.name = 'DirectionalLight Target'

    light.position.set(5, 10, 7.5)

    editor.execute(new AddObjectCommand(editor, light))
  })
  options.add(option)

  // HemisphereLight

  option = new UIRow()
  option.setClass('option')
  option.setTextContent(strings.getKey('menubar/add/hemispherelight'))
  option.onClick(function () {
    const skyColor = 0x00aaff
    const groundColor = 0xffaa00
    const intensity = 1

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    light.name = 'HemisphereLight'

    light.position.set(0, 10, 0)

    editor.execute(new AddObjectCommand(editor, light))
  })
  options.add(option)

  // PointLight

  option = new UIRow()
  option.setClass('option')
  option.setTextContent(strings.getKey('menubar/add/pointlight'))
  option.onClick(function () {
    const color = 0xffffff
    const intensity = 1
    const distance = 0

    const light = new THREE.PointLight(color, intensity, distance)
    light.name = 'PointLight'

    editor.execute(new AddObjectCommand(editor, light))
  })
  options.add(option)

  // SpotLight

  option = new UIRow()
  option.setClass('option')
  option.setTextContent(strings.getKey('menubar/add/spotlight'))
  option.onClick(function () {
    const color = 0xffffff
    const intensity = 1
    const distance = 0
    const angle = Math.PI * 0.1
    const penumbra = 0

    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra)
    light.name = 'SpotLight'
    light.target.name = 'SpotLight Target'

    light.position.set(5, 10, 7.5)

    editor.execute(new AddObjectCommand(editor, light))
  })
  options.add(option)

  return container
}

export { MenubarAdd }
