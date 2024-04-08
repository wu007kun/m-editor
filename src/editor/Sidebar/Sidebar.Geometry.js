import { UIPanel, UISpan } from '../libs/ui.js'

import { SidebarGeometryBufferGeometry } from './Sidebar.Geometry.BufferGeometry.js'

function SidebarGeometry (editor) {
  const signals = editor.signals

  const container = new UIPanel()
  container.setBorderTop('0')
  container.setDisplay('none')
  container.setPaddingTop('20px')

  const parameters = new UISpan()
  container.add(parameters)

  container.add(new SidebarGeometryBufferGeometry(editor))

  async function build () {
    const object = editor.selected

    if (object && object.geometry) {
      container.setDisplay('block')
    } else {
      container.setDisplay('none')
    }
  }

  signals.objectSelected.add(function () {
    build()
  })

  signals.geometryChanged.add(build)

  return container
}

export { SidebarGeometry }
