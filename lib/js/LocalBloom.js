export default class LocalBloom {
  constructor ({
    width = null,
    height = null,
    bloomStrength = 0.0, // 强度 1
    bloomThreshold = 1.1, // 阀值 0
    bloomRadius = 0.19, // 半径 0.1
    flicker = false
  }) {
    this._bloomStrength = bloomStrength
    this._bloomThreshold = bloomThreshold
    this._bloomRadius = bloomRadius
    this._width = width
    this._height = height
    this._materials = {}
    this._glows = []
    this._flicker = flicker
    this._darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

    // 渲染通道
    this.renderScene = new THREE.RenderPass(window.sandbox.scene, window.sandbox.camera)
    // 辉光通道
    this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), this._bloomStrength, this._bloomRadius, this._bloomThreshold)
    // 辉光合成器

    this.bloomComposer = new THREE.EffectComposer(window.sandbox.renderer)
    this.bloomComposer.renderToScreen = true
    this.bloomComposer.addPass(this.renderScene)
    this.bloomComposer.addPass(this.bloomPass)
    this.clock = new THREE.Clock()

    // // 最终通道
    // this.finalPass = new ShaderPass(
    //   new THREE.ShaderMaterial({
    //     uniforms: {
    //       baseTexture: { value: null },
    //       bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
    //     },
    //     vertexShader: `
    //     varying vec2 vUv;
    //     void main() {
    //       vUv = uv;
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //     }`,
    //     fragmentShader: `
    //     uniform sampler2D baseTexture;
    //     uniform sampler2D bloomTexture;
    //     varying vec2 vUv;
    //     void main() {
    //       gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
    //     }`,
    //     defines: {}
    //   }), 'baseTexture'
    // )
    // this.finalPass.needsSwap = true

    // 最终合成器
    this.finalComposer = new THREE.EffectComposer(window.sandbox.renderer)
    this.finalComposer.addPass(this.renderScene)
    // this.finalComposer.addPass(this.finalPass)

    window.sandbox.renderCalls.push(this.render.bind(this))
    window.sandbox.sizeCalls.push(this.updateWindow.bind(this))
  }

  add = (value) => {
    this._glows.push(value)
  }

  clear () {
    this._glows = []
  }

  render () {
    if (this._glows.length > 0) {
      // 1.不辉光的先变黑
      window.sandbox.scene.traverse((obj) => {
        this.darkenNonBloomed(obj)
        if (obj instanceof THREE.PointLight) {
          // console.log('ogj', obj)
          obj.visible = false
        }
      })
      window.sandbox.scene.background = new THREE.Color(0x000000)

      // 2.渲染辉光合成器
      this.bloomComposer.render()
      // 3.还原不辉光的材质
      window.sandbox.scene.traverse(obj => {
        this.restoreMaterial(obj)
        if (obj instanceof THREE.PointLight) {
          obj.visible = true
        }
      })
      window.sandbox.scene.background = new THREE.Color(0x0b1430)

      // 4.渲染最终合成器
      this.finalComposer.render()

      const time = this.clock.getElapsedTime()
      if (this._flicker) {
        this.bloomPass.strength = (this._bloomStrength / 2 + Math.abs(Math.cos(time * 3)) * 1.5)
      }
    }
  }

  updateWindow () {
    this.bloomComposer.setSize(this._width || window.innerWidth, this._height || window.innerHeight)
    this.finalComposer.setSize(this._width || window.innerWidth, this._height || window.innerHeight)
  }

  darkenNonBloomed (obj) {
    if (!this._glows.includes(obj)) {
      this._materials[obj.uuid] = obj.material
      obj.material = this._darkMaterial
    }
  }

  /**
   * 还原材质
   */
  restoreMaterial (obj) {
    if (this._materials[obj.uuid]) {
      obj.material = this._materials[obj.uuid]
      delete this._materials[obj.uuid]
    }
  }

  gui () {
    this.gui = new THREE.GUI({ width: 300 })
    const params = {
      bloomStrength: this._bloomStrength,
      bloomThreshold: this._bloomThreshold,
      bloomRadius: this._bloomRadius
    }
    this.gui.add(params, 'bloomThreshold', 0.0, 1.0).step(0.01).name('阈值').onChange(function (value) {
      this.bloomPass.threshold = Number(value)
    }.bind(this))
    this.gui.add(params, 'bloomStrength', 0.0, 10.0).step(0.01).name('强度').onChange(function (value) {
      this.bloomPass.strength = Number(value)
    }.bind(this))
    this.gui.add(params, 'bloomRadius', 0.0, 5.0).step(0.01).name('半径').onChange(function (value) {
      this.bloomPass.radius = Number(value)
    }.bind(this))
  }

  destroy () {
    this._glows = []
    this.renderScene.dispose()
    this.bloomComposer.dispose()
    this.finalComposer.dispose()

    // 销毁render与窗口更新
    const renderIndex = window.sandbox.renderCalls.findIndex(this.render.bind(this))
    window.sandbox.renderCalls?.splice(renderIndex, 1)
    const index = window.sandbox.sizeCalls.findIndex(this.updateWindow.bind(this))
    window.sandbox.sizeCalls?.splice(index, 1)
    this.gui.destroy()
  }

  // 定义呼吸灯闪烁
  get flicker () {
    return this._flicker
  }

  set flicker (bool) {
    this._flicker = bool
  }

  get bloomStrength () {
    return this._bloomStrength
  }

  set bloomStrength (value) {
    this._bloomStrength = Number(value)
  }

  get bloomThreshold () {
    return this._bloomThreshold
  }

  set bloomThreshold (value) {
    this._bloomThreshold = Number(value)
  }

  get bloomRadius () {
    return this._bloomRadius
  }

  set bloomRadius (value) {
    this._bloomRadius = Number(value)
  }
}
