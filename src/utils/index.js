import TWEEN from '@tweenjs/tween.js'

export function flyTo ({ pos, distance = 60, interval = 1 }) {
  return new Promise((resolve) => {
    animate()
    // newPos 经验参数，勿动
    const distRatio = 1 + distance / Math.hypot(pos.x, pos.y, pos.z)
    const newPos = pos.x || pos.y || pos.z
      ? { x: pos.x * distRatio, y: pos.y * distRatio, z: pos.z * distRatio }
      : { x: 0, y: 0, z: distance } // 特殊情况，如果节点在(0,0,0)

    new TWEEN.Tween(window.sandbox.camera.position).to({
      x: newPos.x,
      y: newPos.y,
      z: newPos.z
    }, interval * 1000).easing(TWEEN.Easing.Quadratic.Out).start() // easing 指定动画缓动函数
      .onUpdate(function () {
        window.sandbox.controls.enabled = false
      })
      .onComplete(() => {
        resolve()
        cancelAnimationFrame(requestId)
        requestId = null
        window.sandbox.controls.enabled = true
      })
  })
}
let requestId
function animate () {
  requestId = requestAnimationFrame(animate)
  TWEEN.update() // 更新 Tween 动画
}

export function formatNumber (input) {
  return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
