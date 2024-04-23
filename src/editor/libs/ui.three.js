import { UISpan, UICheckbox, UIText } from './ui.js'

const { KTX2Loader, RGBELoader, TGALoader } = THREE
const cache = new Map()

class UITexture extends UISpan {
  constructor (editor) {
    super()

    const scope = this
    this.dom.style.height = '24px'
    const form = document.createElement('form')

    const input = document.createElement('input')
    input.type = 'file'
    input.addEventListener('change', function (event) {
      loadFile(event.target.files[0])
    })
    form.appendChild(input)

    const canvas = document.createElement('canvas')
    canvas.width = 36
    canvas.height = 22
    canvas.style.cursor = 'pointer'
    canvas.style.marginRight = '5px'
    canvas.style.border = '1px solid #999'
    canvas.addEventListener('click', function () {
      input.click()
    })
    canvas.addEventListener('drop', function (event) {
      event.preventDefault()
      event.stopPropagation()
      loadFile(event.dataTransfer.files[0])
    })
    this.dom.appendChild(canvas)

    function loadFile (file) {
      const extension = file.name.split('.').pop().toLowerCase()
      const reader = new FileReader()

      const hash = `${file.lastModified}_${file.size}_${file.name}`

      if (cache.has(hash)) {
        const texture = cache.get(hash)

        scope.setValue(texture)

        if (scope.onChangeCallback) scope.onChangeCallback(texture)
      } else if (extension === 'hdr' || extension === 'pic') {
        reader.addEventListener('load', function (event) {
          // assuming RGBE/Radiance HDR image format

          const loader = new RGBELoader()
          loader.load(event.target.result, function (hdrTexture) {
            hdrTexture.sourceFile = file.name

            cache.set(hash, hdrTexture)

            scope.setValue(hdrTexture)

            if (scope.onChangeCallback) scope.onChangeCallback(hdrTexture)
          })
        })

        reader.readAsDataURL(file)
      } else if (extension === 'tga') {
        reader.addEventListener('load', function (event) {
          const loader = new TGALoader()
          loader.load(event.target.result, function (texture) {
            texture.colorSpace = THREE.SRGBColorSpace
            texture.sourceFile = file.name

            cache.set(hash, texture)

            scope.setValue(texture)

            if (scope.onChangeCallback) scope.onChangeCallback(texture)
          })
        }, false)

        reader.readAsDataURL(file)
      } else if (extension === 'ktx2') {
        reader.addEventListener('load', function (event) {
          const arrayBuffer = event.target.result
          const blobURL = URL.createObjectURL(new Blob([arrayBuffer]))
          const ktx2Loader = new KTX2Loader()
          ktx2Loader.setTranscoderPath('../../examples/jsm/libs/basis/')
          editor.signals.rendererDetectKTX2Support.dispatch(ktx2Loader)

          ktx2Loader.load(blobURL, function (texture) {
            texture.colorSpace = THREE.SRGBColorSpace
            texture.sourceFile = file.name
            texture.needsUpdate = true

            cache.set(hash, texture)

            scope.setValue(texture)

            if (scope.onChangeCallback) scope.onChangeCallback(texture)
            ktx2Loader.dispose()
          })
        })

        reader.readAsArrayBuffer(file)
      } else if (file.type.match('image.*')) {
        reader.addEventListener('load', function (event) {
          const image = document.createElement('img')
          image.addEventListener('load', function () {
            const texture = new THREE.Texture(this)
            texture.sourceFile = file.name
            texture.needsUpdate = true

            cache.set(hash, texture)

            scope.setValue(texture)

            if (scope.onChangeCallback) scope.onChangeCallback(texture)
          }, false)

          image.src = event.target.result
        }, false)

        reader.readAsDataURL(file)
      }

      form.reset()
    }

    this.texture = null
    this.onChangeCallback = null
  }

  getValue () {
    return this.texture
  }

  setValue (texture) {
    const canvas = this.dom.children[0]
    const context = canvas.getContext('2d')

    // Seems like context can be null if the canvas is not visible
    if (context) {
      // Always clear the context before set new texture, because new texture may has transparency
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (texture !== null) {
      const image = texture.image

      if (image !== undefined && image !== null && image.width > 0) {
        canvas.title = texture.sourceFile
        const scale = canvas.width / image.width

        if (texture.isDataTexture || texture.isCompressedTexture) {
          const canvas2 = renderToCanvas(texture)
          context.drawImage(canvas2, 0, 0, image.width * scale, image.height * scale)
        } else {
          context.drawImage(image, 0, 0, image.width * scale, image.height * scale)
        }
      } else {
        canvas.title = texture.sourceFile + ' (error)'
      }
    } else {
      canvas.title = 'empty'
    }

    this.texture = texture
  }

  setColorSpace (colorSpace) {
    const texture = this.getValue()

    if (texture !== null) {
      texture.colorSpace = colorSpace
    }

    return this
  }

  onChange (callback) {
    this.onChangeCallback = callback

    return this
  }
}

class UIBoolean extends UISpan {
  constructor (boolean, text) {
    super()

    this.setMarginRight('4px')

    this.checkbox = new UICheckbox(boolean)
    this.text = new UIText(text).setMarginLeft('3px')

    this.add(this.checkbox)
    this.add(this.text)
  }

  getValue () {
    return this.checkbox.getValue()
  }

  setValue (value) {
    return this.checkbox.setValue(value)
  }
}

let renderer

function renderToCanvas (texture) {
  if (renderer === undefined) {
    renderer = new THREE.WebGLRenderer()
  }

  const image = texture.image

  renderer.setSize(image.width, image.height, false)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const material = new THREE.MeshBasicMaterial({ map: texture })
  const quad = new THREE.PlaneGeometry(2, 2)
  const mesh = new THREE.Mesh(quad, material)
  scene.add(mesh)

  renderer.render(scene, camera)

  return renderer.domElement
}

export { UITexture, UIBoolean }
