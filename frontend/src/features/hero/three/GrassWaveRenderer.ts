import {
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  OrthographicCamera,
  Plane,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

const TAU = Math.PI * 2
const BLADE_SEGMENTS = 3
const BLADE_PATH = [0, 0.32, 0.66, 1]

type QualityTier = 'high' | 'balanced' | 'low'

interface QualityProfile {
  targetCount: number
  maximumPixelRatio: number
  frameInterval: number
}

const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    targetCount: 48_000,
    maximumPixelRatio: 1.25,
    frameInterval: 1000 / 60,
  },
  balanced: {
    targetCount: 32_000,
    maximumPixelRatio: 1,
    frameInterval: 1000 / 30,
  },
  low: {
    targetCount: 12_000,
    maximumPixelRatio: 0.7,
    frameInterval: 1000 / 24,
  },
}

function detectQualityTier(softwareRenderer: boolean): QualityTier {
  if (softwareRenderer) {
    return 'low'
  }

  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const deviceMemory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  if (
    hardwareConcurrency <= 2 ||
    (deviceMemory !== undefined && deviceMemory <= 2)
  ) {
    return 'low'
  }

  if (
    hardwareConcurrency <= 4 ||
    (deviceMemory !== undefined && deviceMemory <= 4) ||
    coarsePointer
  ) {
    return 'balanced'
  }

  return 'high'
}

function detectSoftwareRenderer() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl')

  if (!context) {
    return true
  }

  const extension = context.getExtension('WEBGL_debug_renderer_info') as {
    UNMASKED_RENDERER_WEBGL: number
  } | null
  const rendererName = extension
    ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL))
    : ''
  const loseContext = context.getExtension('WEBGL_lose_context')

  loseContext?.loseContext()

  return /swiftshader|llvmpipe|software/i.test(rendererName)
}

const vertexShader = /* glsl */ `
  precision highp float;

  attribute vec2 aBase;
  attribute float aHeight;
  attribute float aPhase;
  attribute float aScale;
  attribute float aTint;
  attribute float aLean;

  uniform float uTime;
  uniform vec3 uPointer;
  uniform float uPointerInfluence;
  uniform float uPointerSpeed;
  uniform float uDarkMode;

  varying vec3 vColor;
  varying float vAlpha;

  float terrainHeight(vec2 point) {
    float height = sin(point.x * 0.115 + 0.48) * 1.16;
    height += cos(point.y * 0.17 - point.x * 0.055 + 0.84) * 1.02;
    height += sin((point.x + point.y * 0.72) * 0.27 - 0.34) * 0.58;
    height += cos(length(point * vec2(0.62, 0.46) + vec2(-5.0, 2.5)) * 0.32)
      * 0.28;
    return height;
  }

  void main() {
    float top = clamp(position.y, 0.0, 1.0);
    float curve = pow(top, 1.38);
    vec3 base = vec3(aBase.x, terrainHeight(aBase), aBase.y);
    float bladeHeight = aHeight * (0.82 + aScale * 0.32);

    float primaryWind = sin(
      uTime * 1.18 + aPhase + aBase.x * 0.5 + aBase.y * 0.28
    );
    float detailWind = sin(
      uTime * 2.45 + aPhase * 1.7 + aBase.x * 1.26 - aBase.y * 0.54
    );
    float gust = sin(uTime * 0.42 + aBase.x * 0.12 - aBase.y * 0.08);
    float windStrength = 0.72 + gust * 0.22;
    vec2 windOffset = vec2(
      (primaryWind * 0.14 + detailWind * 0.052) * windStrength,
      (primaryWind * 0.035 + detailWind * 0.018) * windStrength
    ) * curve;

    vec2 toPointer = base.xz - uPointer.xz;
    float pointerDistance = length(toPointer);
    float pointerFalloff = 1.0 - smoothstep(0.0, 2.4, pointerDistance);
    vec2 awayFromPointer = toPointer / max(pointerDistance, 0.001);
    vec2 pointerOffset = awayFromPointer
      * pointerFalloff
      * uPointerInfluence
      * (0.72 + uPointerSpeed * 0.78)
      * pow(top, 1.18);

    vec2 leanOffset = vec2(aLean * 0.11, aLean * 0.025) * top;
    vec3 transformed = base;
    transformed.xz += windOffset + pointerOffset + leanOffset;
    transformed.y += bladeHeight * top;
    transformed.y += sin(
      uTime * 1.9 + aPhase + length(base.xz) * 0.38
    ) * 0.018 * top;

    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    float elevation = terrainHeight(aBase);
    float ridge = smoothstep(-1.25, 1.45, elevation);
    float sunSide = smoothstep(-11.0, 15.0, aBase.x)
      * smoothstep(-10.0, 10.0, aBase.y);
    float sunFacing = smoothstep(0.44, 0.92, ridge + sunSide * 0.18);
    float sunRidge = smoothstep(
      0.52,
      1.0,
      ridge * 0.78 + sunFacing * 0.46 + sunSide * 0.2
    );
    float tipLight = pow(top, 3.2);

    vec3 valleyBlue = mix(
      vec3(0.005, 0.12, 0.19),
      vec3(0.004, 0.07, 0.12),
      uDarkMode
    );
    vec3 deepTeal = mix(
      vec3(0.012, 0.27, 0.3),
      vec3(0.008, 0.13, 0.16),
      uDarkMode
    );
    vec3 blueGreen = mix(
      vec3(0.025, 0.4, 0.42),
      vec3(0.015, 0.18, 0.22),
      uDarkMode
    );
    vec3 meadowGreen = mix(
      vec3(0.075, 0.43, 0.23),
      vec3(0.04, 0.2, 0.12),
      uDarkMode
    );
    vec3 freshGreen = mix(
      vec3(0.22, 0.51, 0.2),
      vec3(0.1, 0.24, 0.1),
      uDarkMode
    );
    vec3 yellowGreen = mix(
      vec3(0.57, 0.6, 0.17),
      vec3(0.28, 0.3, 0.08),
      uDarkMode
    );
    vec3 warmGold = mix(
      vec3(0.96, 0.74, 0.29),
      vec3(0.44, 0.36, 0.14),
      uDarkMode
    );
    vec3 fuzzyTip = mix(
      vec3(0.8, 0.88, 0.48),
      vec3(0.34, 0.38, 0.2),
      uDarkMode
    );

    vec3 color = mix(valleyBlue, deepTeal, smoothstep(-0.2, 0.46, ridge));
    color = mix(color, blueGreen, smoothstep(0.12, 0.62, ridge));
    color = mix(color, meadowGreen, smoothstep(0.38, 0.8, ridge));
    color = mix(color, freshGreen, smoothstep(0.62, 0.96, ridge));
    color = mix(color, yellowGreen, sunRidge * 0.82);
    color = mix(color, warmGold, sunRidge * (0.18 + smoothstep(0.42, 1.0, tipLight) * 0.78));
    color = mix(color, fuzzyTip, tipLight * (0.1 + sunRidge * 0.42));

    float microLight = fract(aTint * 17.31 + aPhase * 0.113);
    color *= mix(0.74, 1.08, microLight);
    color *= mix(1.0, 0.62, smoothstep(0.0, 22.0, transformed.z));
    color += mix(
      vec3(0.05, 0.18, 0.15),
      vec3(0.02, 0.06, 0.08),
      uDarkMode
    ) * pointerFalloff * uPointerInfluence;

    float depthFade = smoothstep(-20.0, -5.0, transformed.z)
      * (1.0 - smoothstep(8.0, 18.0, transformed.z));
    float horizonDistance = smoothstep(-13.0, -1.0, transformed.z);
    vec3 horizonHaze = mix(
      mix(vec3(0.54, 0.72, 0.8), vec3(0.18, 0.28, 0.34), uDarkMode),
      warmGold,
      sunSide * smoothstep(0.48, 0.95, ridge) * 0.34
    );
    color = mix(horizonHaze, color, mix(0.58, 1.0, depthFade));

    vColor = color;
    vAlpha = (0.32 + top * 0.68)
      * mix(0.48, 1.0, depthFade)
      * mix(0.1, 1.0, horizonDistance);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    if (vAlpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(vColor, vAlpha);
  }
`

export class GrassWaveRenderer {
  private readonly container: HTMLElement
  private readonly scene = new Scene()
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 90)
  private readonly renderer: WebGLRenderer
  private readonly geometry: BufferGeometry
  private readonly material: ShaderMaterial
  private readonly pointerPlane = new Plane(new Vector3(0, 1, 0), -0.7)
  private readonly raycaster = new Raycaster()
  private readonly normalizedPointer = new Vector2()
  private readonly pointerTarget = new Vector3(0, 0.7, 0)
  private readonly pointerPosition = new Vector3(0, 0.7, 0)
  private readonly resizeObserver: ResizeObserver
  private viewport = { left: 0, top: 0, width: 1, height: 1 }
  private pointerInfluence = 0
  private pointerInfluenceTarget = 0
  private pointerSpeed = 0
  private pointerSpeedTarget = 0
  private pendingPointerX = 0
  private pendingPointerY = 0
  private pointerDirty = false
  private animationFrame = 0
  private startTime = 0
  private lastFrameTime = performance.now()
  private lastRenderTime = 0
  private lastWidth = 0
  private lastHeight = 0
  private lastPixelRatio = 0
  private disposed = false
  private started = false
  private visible = true
  private animationActive = false
  private readonly softwareRenderer = detectSoftwareRenderer()
  private readonly qualityTier: QualityTier
  private readonly qualityProfile: QualityProfile
  private readonly reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor(container: HTMLElement) {
    this.container = container
    this.qualityTier = detectQualityTier(this.softwareRenderer)
    this.qualityProfile = QUALITY_PROFILES[this.qualityTier]
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: !this.softwareRenderer,
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.domElement.setAttribute('aria-hidden', 'true')
    this.renderer.domElement.dataset.quality = this.qualityTier

    this.camera.position.set(0, 11.5, 11.2)
    this.camera.lookAt(0, 4.6, -0.8)

    this.geometry = this.createGeometry()
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: this.pointerPosition },
        uPointerInfluence: { value: 0 },
        uPointerSpeed: { value: 0 },
        uDarkMode: { value: 0 },
      },
    })

    const lines = new LineSegments(this.geometry, this.material)
    lines.frustumCulled = false
    this.scene.add(lines)

    this.container.prepend(this.renderer.domElement)
    this.renderer.domElement.className = 'grass-wave-canvas__surface'

    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.container)

    this.container.addEventListener('pointermove', this.handlePointerMove)
    this.container.addEventListener('pointerenter', this.handlePointerMove)
    this.container.addEventListener('pointerleave', this.handlePointerLeave)
    this.container.addEventListener('pointercancel', this.handlePointerLeave)
  }

  start() {
    this.started = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.lastRenderTime = 0
    this.handleResize()
    this.syncAnimation()
  }

  pause() {
    if (!this.visible) {
      return
    }

    this.visible = false
    this.syncAnimation()
  }

  resume() {
    if (this.visible) {
      return
    }

    this.visible = true
    this.syncAnimation()
  }

  setDarkMode(isDark: boolean) {
    this.material.uniforms.uDarkMode.value = isDark ? 1 : 0

    if (this.reducedMotion) {
      this.renderScene(performance.now())
    }
  }

  dispose() {
    this.disposed = true
    this.animationActive = false
    cancelAnimationFrame(this.animationFrame)
    this.resizeObserver.disconnect()

    this.container.removeEventListener('pointermove', this.handlePointerMove)
    this.container.removeEventListener('pointerenter', this.handlePointerMove)
    this.container.removeEventListener('pointerleave', this.handlePointerLeave)
    this.container.removeEventListener('pointercancel', this.handlePointerLeave)

    this.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }

  private createGeometry() {
    const width = Math.max(this.container.clientWidth, 320)
    const aspect = width / Math.max(this.container.clientHeight, 320)
    const widthScale = width < 640 ? 0.72 : width < 1100 ? 0.84 : 1
    const targetCount = Math.round(
      this.qualityProfile.targetCount * widthScale,
    )
    const columns = Math.max(54, Math.round(Math.sqrt(targetCount * aspect)))
    const rows = Math.ceil(targetCount / columns)
    const bladeCount = columns * rows
    const verticesPerBlade = BLADE_SEGMENTS * 2

    const positions = new Float32Array(bladeCount * verticesPerBlade * 3)
    const bases = new Float32Array(bladeCount * verticesPerBlade * 2)
    const heights = new Float32Array(bladeCount * verticesPerBlade)
    const phases = new Float32Array(bladeCount * verticesPerBlade)
    const scales = new Float32Array(bladeCount * verticesPerBlade)
    const tints = new Float32Array(bladeCount * verticesPerBlade)
    const leans = new Float32Array(bladeCount * verticesPerBlade)

    const widthSpan = 52
    const depthSpan = 38

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column
        const normalizedColumn = column / Math.max(columns - 1, 1)
        const normalizedRow = row / Math.max(rows - 1, 1)
        const jitterX = (Math.random() - 0.5) * (widthSpan / columns) * 0.9
        const jitterZ = (Math.random() - 0.5) * (depthSpan / rows) * 0.9
        const x = (normalizedColumn - 0.5) * widthSpan + jitterX
        const z = (normalizedRow - 0.36) * depthSpan + jitterZ
        const random = Math.random()
        const tint =
          normalizedColumn * 0.44
          + normalizedRow * 0.34
          + random * 0.22
        const bladeHeight = 0.34 + Math.pow(random, 1.28) * 1.18
        const phase = random * TAU
        const lean = (Math.random() - 0.5) * 2

        for (let segment = 0; segment < BLADE_SEGMENTS; segment += 1) {
          const startVertex = index * verticesPerBlade + segment * 2
          const startPosition = startVertex * 3
          const startAttribute = startVertex
          const yStart = BLADE_PATH[segment]
          const yEnd = BLADE_PATH[segment + 1]

          positions[startPosition] = 0
          positions[startPosition + 1] = yStart
          positions[startPosition + 2] = 0
          positions[startPosition + 3] = 0
          positions[startPosition + 4] = yEnd
          positions[startPosition + 5] = 0

          for (let vertex = 0; vertex < 2; vertex += 1) {
            const attributeIndex = startAttribute + vertex
            const attributeOffset = attributeIndex * 2

            bases[attributeOffset] = x
            bases[attributeOffset + 1] = z
            heights[attributeIndex] = bladeHeight
            phases[attributeIndex] = phase
            scales[attributeIndex] = random
            tints[attributeIndex] = tint
            leans[attributeIndex] = lean
          }
        }
      }
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aBase', new BufferAttribute(bases, 2))
    geometry.setAttribute('aHeight', new BufferAttribute(heights, 1))
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1))
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1))
    geometry.setAttribute('aTint', new BufferAttribute(tints, 1))
    geometry.setAttribute('aLean', new BufferAttribute(leans, 1))

    return geometry
  }

  private readonly handleResize = () => {
    const width = Math.max(this.container.clientWidth, 1)
    const height = Math.max(this.container.clientHeight, 1)
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      this.qualityProfile.maximumPixelRatio,
    )

    if (
      width === this.lastWidth &&
      height === this.lastHeight &&
      pixelRatio === this.lastPixelRatio
    ) {
      return
    }

    this.lastWidth = width
    this.lastHeight = height
    this.lastPixelRatio = pixelRatio
    const bounds = this.container.getBoundingClientRect()
    this.viewport = {
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    }
    const aspect = width / height
    const viewHeight = width < 700 ? 23 : 24
    const halfHeight = viewHeight / 2
    const halfWidth = halfHeight * aspect

    this.camera.left = -halfWidth
    this.camera.right = halfWidth
    this.camera.top = halfHeight
    this.camera.bottom = -halfHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(width, height, false)

    if (this.reducedMotion) {
      this.renderScene(performance.now())
    }
  }

  private syncAnimation() {
    if (this.disposed || !this.started) {
      return
    }

    if (!this.visible) {
      this.animationActive = false
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = 0
      return
    }

    if (this.reducedMotion) {
      this.renderScene(performance.now())
      return
    }

    if (this.animationActive) {
      return
    }

    this.animationActive = true
    this.lastFrameTime = performance.now()
    this.lastRenderTime = 0
    this.animationFrame = requestAnimationFrame(this.renderFrame)
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    this.pendingPointerX = event.clientX
    this.pendingPointerY = event.clientY
    this.pointerDirty = true
    this.pointerInfluenceTarget = 1
  }

  private readonly handlePointerLeave = () => {
    this.pointerDirty = false
    this.pointerInfluenceTarget = 0
    this.pointerSpeedTarget = 0
  }

  private updatePointerTarget() {
    if (!this.pointerDirty || this.viewport.width <= 0) {
      return
    }

    const normalizedX =
      ((this.pendingPointerX - this.viewport.left) / this.viewport.width) * 2 -
      1
    const normalizedY =
      -(
        ((this.pendingPointerY - this.viewport.top) / this.viewport.height) *
          2 -
        1
      )
    const previousX = this.normalizedPointer.x
    const previousY = this.normalizedPointer.y

    this.normalizedPointer.set(normalizedX, normalizedY)
    this.raycaster.setFromCamera(this.normalizedPointer, this.camera)
    this.raycaster.ray.intersectPlane(this.pointerPlane, this.pointerTarget)
    this.pointerSpeedTarget = Math.min(
      Math.hypot(normalizedX - previousX, normalizedY - previousY) * 3.8,
      1,
    )
    this.pointerDirty = false
  }

  private readonly renderFrame = (time: number) => {
    if (this.disposed || !this.animationActive) {
      return
    }

    const elapsedSinceLastRender = time - this.lastRenderTime

    if (elapsedSinceLastRender < this.qualityProfile.frameInterval) {
      this.animationFrame = requestAnimationFrame(this.renderFrame)
      return
    }

    this.lastRenderTime =
      time -
      (elapsedSinceLastRender % this.qualityProfile.frameInterval)

    this.renderScene(time)

    if (this.animationActive) {
      this.animationFrame = requestAnimationFrame(this.renderFrame)
    }
  }

  private renderScene(time: number) {
    if (this.viewport.width <= 0) {
      return
    }

    this.updatePointerTarget()
    const elapsed = (time - this.startTime) / 1000
    const delta = Math.min(
      Math.max((time - this.lastFrameTime) / 1000, 0),
      0.05,
    )
    this.lastFrameTime = time

    const pointerApproach = 1 - Math.exp(
      -(this.pointerInfluenceTarget > 0.5 ? 12 : 6) * delta,
    )
    const influenceApproach = 1 - Math.exp(
      -(this.pointerInfluenceTarget > 0.5 ? 9 : 5) * delta,
    )
    const speedApproach = 1 - Math.exp(-8 * delta)

    this.pointerPosition.lerp(this.pointerTarget, pointerApproach)
    this.pointerInfluence +=
      (this.pointerInfluenceTarget - this.pointerInfluence) * influenceApproach
    this.pointerSpeed +=
      (this.pointerSpeedTarget - this.pointerSpeed) * speedApproach
    this.pointerSpeedTarget *= Math.exp(-6 * delta)

    const pointerX = this.normalizedPointer.x * 0.1
    const cameraDrift = Math.sin(elapsed * 0.2) * 0.06
    this.camera.position.x +=
      (pointerX + cameraDrift - this.camera.position.x) * 0.02
    this.camera.position.y = 11.5 + Math.sin(elapsed * 0.28) * 0.035
    this.camera.lookAt(0, 4.6, -0.8)

    this.material.uniforms.uTime.value = elapsed
    this.material.uniforms.uPointerInfluence.value = this.pointerInfluence
    this.material.uniforms.uPointerSpeed.value = this.pointerSpeed

    this.renderer.render(this.scene, this.camera)
  }
}
