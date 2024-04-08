export default class {
  constructor (elemId) {
    this.container = document.getElementById(elemId)
    this._width = this.container.offsetWidth
    this._height = this.container.offsetHeight
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true })

    this.camera = new THREE.PerspectiveCamera(90, this._width / this._height, 0.01, 10000)
    this.camera.position.set(0, 1000, 1000)
    this.renderer.setSize(this._width, this._height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.scene.background = new THREE.Color(0x000000)
    this.scene.fog = new THREE.Fog(0x0b1430, 0, 10000)
    this.container.appendChild(this.renderer.domElement)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    this.initLight()

    this.renderCalls = []
    this.sizeCalls = []
    window.addEventListener('click', this.handlerClick.bind(this))
    this.render()

    const objResizeObserver = new ResizeObserver((entries) => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = setTimeout(() => {
        this.resize()
        this.resizeTimer = null
      }, 50)
    })
    objResizeObserver.observe(this.container)

    document.addEventListener('keyup', e => {
      console.log(window.devicePixelRatio)
      this.resize()
    })
  }

  resize () {
    this._width = this.container.offsetWidth
    this._height = this.container.offsetHeight

    this.camera.aspect = this._width / this._height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this._width, this._height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.sizeCalls?.forEach((fn) => {
      fn()
    })
  }

  render (e) {
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.renderCalls?.forEach((fn) => {
      fn(e)
    })
    requestAnimationFrame(this.render.bind(this))
  }

  initLight () {
    // const environment = new THREE.RoomEnvironment(this.renderer)
    // const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    // 之前的写法会涉及到shaderMaterial无法使用
    // this.scene.environment = pmremGenerator.fromScene(environment).texture

    // 环境光 光强影响特效
    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    ambient.position.set(-1000, 1000, -1000)

    // 平行光
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight1.position.set(-200, 1400, 800)

    this.scene.add(ambient, directionalLight1)
  }

  createComposer () {
    const renderPass = new THREE.RenderPass(this.scene, this.camera)
    const params = {
      bloomStrength: 0.4, // 0.5
      bloomRadius: 0.2,
      bloomThreshold: 0.1// 0.1

    }
    const unrealBloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(this._width, this._height), // 分辨率
      params.bloomStrength, // 泛光强度
      params.bloomThreshold, // 半径
      params.bloomRadius // 阈值
    )
    unrealBloomPass.renderToScreen = true

    const composer = new THREE.EffectComposer(this.renderer) // 用于管理后期处理效果
    composer.addPass(renderPass)
    composer.addPass(unrealBloomPass)
    composer.renderTarget1.samples = 16
    composer.renderTarget2.samples = 16

    const gui = new THREE.GUI({ width: 300 })
    gui.add(params, 'bloomStrength', 0.0, 2.0).step(0.01).name('强度').onChange(function (value) {
      unrealBloomPass.strength = Number(value)
    })
    gui.add(params, 'bloomRadius', 0.0, 2.0).step(0.01).name('半径').onChange(function (value) {
      unrealBloomPass.radius = Number(value)
    })
    gui.add(params, 'bloomThreshold', 0.0, 2.0).step(0.01).name('阈值').onChange(function (value) {
      unrealBloomPass.threshold = Number(value)
    })
    this.renderCalls.push(() => composer.render())
  }

  // 模型点击事件
  handlerClick (e) {
    const mouse = new THREE.Vector2()
    const rayCaster = new THREE.Raycaster()
    mouse.x = (e.clientX / this._width) * 2 - 1
    mouse.y = -(e.clientY / this._height) * 2 + 1
    rayCaster.setFromCamera(mouse, window.sandbox.camera)

    const intersects = rayCaster.intersectObjects(window.sandbox.scene.children)
    if (intersects.length > 0) {
      console.log('拾取点', intersects[0].point)
    }
  }
}
