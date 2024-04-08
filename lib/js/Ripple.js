import Overlay from "./Overlay";

export default class Ripple extends Overlay {
  constructor ({
    sandbox,
    position,
    rotation,
    radius = 100,
    lineWidth = 10,
    interval = 20,
    color = '#fff',
    speed = 1
  }) {
    super()
    const { MeshBasicNodeMaterial, wgslFn, nativeFn, uv, uniform } = THREE.Nodes
    this.sandbox = sandbox

    const geometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -radius, 0,-radius,
      -radius,0, radius,
      radius, 0,radius,
      radius,0, -radius,
    ]);

    const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ])
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ])
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    const someWGSLFn = wgslFn(
      `
        fn someFn(uv:vec2<f32>,time:f32) -> vec4<f32> {
          var vUv:vec2<f32> = uv;

          for (var i:u32 = 1; i < 8; i++) {
            vUv.y += f32(i) * 0.1 / f32(i) * sin(uv.x * f32(i) * f32(i) + time * 0.5) * sin(uv.y * f32(i) * f32(i) + time * 0.5);
          }
          vUv.y = vUv.y / 2.0 + 0.1;
          var col:vec3<f32>;
          col.r = vUv.y - 0.15;
          col.g = vUv.y + 0.15;
          col.b = vUv.y + 0.35;
          return vec4(col, 1.0);
        }
      `, []
    )
    const defaultVS = wgslFn(`
      [[location(0)]] var<in> a_position : vec3<f32>;
      [[location(1)]] var<in> a_uv : vec2<f32>;

      [[builtin(position)]] var<out> gl_Position : vec4<f32>;
      [[location(0)]] var<out> v_position : vec3<f32>;
      [[location(1)]] var<out> v_uv : vec2<f32>;

      [[stage(vertex)]]
      fn main() -> void {
        let modelViewProjection = projectionMatrix * viewMatrix * modelMatrix;
        gl_Position = modelViewProjection * vec4<f32>(a_position, 1.0);
        v_position = a_position;
        v_uv = a_uv;
      }
    `, [])
    const defaultFS = wgslFn(`
      [[location(0)]] var<in> v_position : vec3<f32>;
      [[location(1)]] var<in> v_uv : vec2<f32>;
      [[location(0)]] var<out> out_FragColor : vec4<f32>;
      // [[group(0), binding(0)]] var<uniform> color : vec4<f32>;
      // [[group(0), binding(1)]] var<uniform> size : f32;
      // [[group(0), binding(2)]] var<uniform> lineWidth : f32;
      // [[group(0), binding(3)]] var<uniform> interval : f32;
      // [[group(0), binding(4)]] var<uniform> speed : f32;

      [[stage(fragment)]]
      fn main() -> void {
        // let r = sqrt(pow(v_position.x, 2.0) + pow(v_position.z, 2.0));
        // let dr = r;
        // var a : f32 = 0.0;
        // let mod_r = mod(dr, interval);
        // if (mod_r < lineWidth) {
        //     a = mod_r / lineWidth;
        // }
        // let a2 = 1.0 - r / size * 2.0;
        // out_FragColor = vec4<f32>(color.rgb, a * a2);
        out_FragColor = vec4<f32>(1.0, 0.0, 0.0, 1.0);
      }
    `, [])

    const vs = defaultVS();
    const fs = defaultFS();
    console.log(vs)
    console.log(fs)
    const material = new MeshBasicNodeMaterial()
    material.colorNode = someWGSLFn({ uv: uv(), time: uniform(0.0) })
    // material.vertexNode = vs
    // material.fragmentNode = fs
    material.transparent = true
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    const rotationInRadians = rotation.map(degrees => degrees * (Math.PI / 180))
    mesh.rotation.set(...rotationInRadians);
    sandbox.scene.add(mesh)
    this.color = color
    this.lineWidth = lineWidth
    this.interval = interval
    this.speed = speed

  }

  // get position () {
  //   return this._position
  // }

  // set position (value) {
  //   this._position = { ...value }
  //   this.drawCommand.modelMatrix = this.getModelMatrix()
  //   this.drawCommand.boundingVolume.center = this.modelCenter
  // }

  // get heading () {
  //   return this._heading
  // }

  // set heading (value) {
  //   this._heading = value
  //   this.drawCommand.modelMatrix = this.getModelMatrix()
  // }

  // get pitch () {
  //   return this._pitch
  // }

  // set pitch (value) {
  //   this._pitch = value
  //   this.drawCommand.modelMatrix = this.getModelMatrix()
  // }

  // get roll () {
  //   return this._roll
  // }

  // set roll (value) {
  //   this._roll = value
  //   this.drawCommand.modelMatrix = this.getModelMatrix()
  // }

  // getModelMatrix () {
  //   const { lng, lat, alt } = this._position
  //   this.modelCenter = GC.Cartesian3.fromDegrees(lng, lat, alt)
  //   const originMatrix = GC.Transforms.eastNorthUpToFixedFrame(this.modelCenter)
  //   const axis = GC.Quaternion.fromHeadingPitchRoll(
  //     new GC.HeadingPitchRoll(
  //       this._heading / 180 * GC.Math.PI,
  //       this._pitch / 180 * GC.Math.PI,
  //       this._roll / 180 * GC.Math.PI
  //     )
  //   )
  //   const transform = GC.Matrix4.fromTranslationQuaternionRotationScale(
  //     new GC.Cartesian3(0, 0, 0),
  //     axis,
  //     new GC.Cartesian3(1, 1, 1)
  //   )

  //   const modelMatrix = GC.Matrix4.multiplyTransformation(
  //     originMatrix,
  //     transform,
  //     new GC.Matrix4()
  //   )
  //   return modelMatrix
  // }
}