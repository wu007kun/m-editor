export default class Outline {
  constructor ({
    width = null,
    height = null,
    params = {}
  }) {
    this._width = width
    this._height = height
    this._params = Object.assign({
      edgeStrength: 3.6, // 轮廓的强度 3.0
      edgeGlow: 2.2, // 轮廓的发光强度 0.0
      edgeThickness: 0.4, // 轮廓的厚度 1.0
      pulsePeriod: 1.8, // 轮廓的闪烁速度 0.0
      visibleEdgeColor: '#efefef', // 显示颜色
      hiddenEdgeColor: 'red' // 被遮蔽颜色
    }, params)

    this.composer = new THREE.EffectComposer(window.sandbox.renderer)
    this.renderPass = new THREE.RenderPass(window.sandbox.scene, window.sandbox.camera)
    this.outlinePass = new THREE.OutlinePass(new THREE.Vector2(this._width || window.innerWidth, this._height || window.innerHeight), window.sandbox.scene, window.sandbox.camera)

    //
    this.outlinePass.setSize((this._width || window.innerWidth) / 10, (this._height || window.innerHeight) / 10) // 减少 OutlinePass 的分辨率
    this.outlinePass.edgeStrength = this._params.edgeStrength
    this.outlinePass.edgeGlow = this._params.edgeGlow
    this.outlinePass.edgeThickness = this._params.edgeThickness
    this.outlinePass.pulsePeriod = this._params.pulsePeriod
    this.outlinePass.visibleEdgeColor.set(this._params.visibleEdgeColor)
    this.outlinePass.hiddenEdgeColor.set(this._params.hiddenEdgeColor)
    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.outlinePass)

    window.sandbox.renderCalls.push(this.render.bind(this))
    window.sandbox.sizeCalls.push(this.updateWindow.bind(this))
  }

  add (value) {
    // if (Array.isArray(value)) {
    //   this.outlinePass.selectedObjects = [...value]
    // } else {
    //   this.outlinePass.selectedObjects = value ? [value] : []
    // }
    this.outlinePass.selectedObjects.push(value)
  }

  clear () {
    this.outlinePass.selectedObjects = []
  }

  render () {
    if (this.outlinePass.selectedObjects.length > 0) {
      this.composer.render() //  必须要时刻刷新 composer.render()
    }
  }

  updateWindow () {
    this.composer.setSize(this._width || window.innerWidth, this._height || window.innerHeight)
    this.composer.setSize(this._width || window.innerWidth, this._height || window.innerHeight)
  }

  gui () {
    this.gui = new THREE.GUI({ width: 300 })
    this.gui.add(this._params, 'edgeStrength', 0.01, 20).name('轮廓的强度').step(0.05).onChange(function (value) {
      this.outlinePass.edgeStrength = Number(value)
    }.bind(this))
    this.gui.add(this._params, 'edgeGlow', 0.0, 10).name('轮廓的发光强度').step(0.05).onChange(function (value) {
      this.outlinePass.edgeGlow = Number(value)
    }.bind(this))
    this.gui.add(this._params, 'edgeThickness', 0.0, 10).name('轮廓的厚度').step(0.05).onChange(function (value) {
      this.outlinePass.edgeThickness = Number(value)
    }.bind(this))
    this.gui.add(this._params, 'pulsePeriod', 0.0, 10).name('轮廓的闪烁速度').step(0.05).onChange(function (value) {
      this.outlinePass.pulsePeriod = Number(value)
    }.bind(this))
    const Configuration = function () {
      this.visibleEdgeColor = '#ffffff'
      this.hiddenEdgeColor = '#190a05'
    }
    const conf = new Configuration()
    this.gui.addColor(conf, 'visibleEdgeColor').name('可见轮廓的颜色').onChange(function (value) {
      this.outlinePass.visibleEdgeColor.set(value)
    }.bind(this))
    this.gui.addColor(conf, 'hiddenEdgeColor').name('不可见轮廓的颜色').onChange(function (value) {
      this.outlinePass.hiddenEdgeColor.set(value)
    }.bind(this))
  }

  destroy () {
    this.outlinePass.selectedObjects = []
    this.renderPass.dispose()
    this.composer.dispose()
    this.outlinePass.dispose()

    // 销毁render与窗口更新
    const renderIndex = window.sandbox.renderCalls.findIndex(this.render.bind(this))
    window.sandbox.renderCalls?.splice(renderIndex, 1)
    const index = window.sandbox.sizeCalls.findIndex(this.updateWindow.bind(this))
    window.sandbox.sizeCalls?.splice(index, 1)
    this.gui.destroy()
  }
}
