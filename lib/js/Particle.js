/*
  特效，根据传入两点之间，创建移动的粒子
  可设置间隔，运动时长，粒子大小
*/
export default class particle {
  constructor ({ a, b, step = 3, duration = 0.8, size = 0.2 }) {
    this._a = a
    this._b = b
    this._step = step
    this._duration = duration
    this._size = size

    this.pointArray = []
    this.requestArr = []

    const distance = this._a.distanceTo(this._b) // 计算a和b之间的距离
    const pointCount = Math.floor(distance / this._step) // 计算点的个数
    const interval = distance / pointCount // 计算点之间的间隔

    let requestId
    for (let i = 0; i <= pointCount - 1; i++) {
      const start = this._a.clone().lerp(this._b, i / pointCount) // 计算点的起点
      const end = start.clone().add(this._b.clone().sub(this._a).normalize().multiplyScalar(interval)) // 计算点的终点

      const point = new THREE.Mesh(new THREE.SphereGeometry(this._size), new THREE.MeshBasicMaterial())
      point.position.copy(start)
      this.pointArray.push(point)
      window.sandbox.scene.add(point)

      const tween = new THREE.TWEEN.Tween(point.position)
        .to(end, this._duration * 1000) // 移动到终点
        .onComplete(function () {
          point.visible = false // 隐藏点
          point.position.copy(start) // 移动回起点
        })
        .start()

      const animate = () => {
        requestId = requestAnimationFrame(animate)
        THREE.TWEEN.update()
        if (point.position.distanceTo(start) < 0.1) {
          point.visible = true // 显示点
          tween.start() // 重新开始移动动画
        }
        this.requestArr.push(requestId)
      }
      animate()
    }
  }

  destroy () {
    this.pointArray.forEach(object => {
      object.geometry && object.geometry.dispose()
      object.material && object.material.dispose()
      object.texture && object.texture.dispose()
      window.sandbox.scene.remove(object)
    })
    this.pointArray.length = 0
    for (let i = 0; i < this.requestArr.length; i++) {
      cancelAnimationFrame(this.requestArr[i])
    }
    this.requestArr.length = 0
  }
}
