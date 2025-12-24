import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

/**
 * Shadertoy 上的全屏雪花着色器
 * 基于 https://www.shadertoy.com/view/ldsGDn 的效果
 * 使用分层方法创建更自然的雪花效果
 */
const SnowShaderMaterial = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uSpeed;
    uniform float uIntensity;
    uniform vec2 uMouse;  // 鼠标视差偏移
    uniform int uLayerStart;  // 渲染层范围起始
    uniform int uLayerEnd;    // 渲染层范围结束

    varying vec2 vUv;

    void main() {
      vec2 fragCoord = vUv * uResolution;

      float snow = 0.0;
      float gradient = (1.0 - (fragCoord.y / uResolution.x)) * 0.4;
      float random = fract(sin(dot(fragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);

      float time = uTime * uSpeed;

      // 6层雪花，每层12次迭代，根据 layerRange 过滤
      for(int k = 0; k < 6; k++) {
        if(k < uLayerStart || k > uLayerEnd) continue;
        for(int i = 0; i < 12; i++) {
          float cellSize = 2.0 + (float(i) * 3.0);
          float downSpeed = 0.3 + (sin(time * 0.4 + float(k + i * 20)) + 1.0) * 0.00008;

          // 视差偏移：不同层使用不同强度，近景层(k大)偏移更多
          float parallaxFactor = 0.5 + float(k) * 0.1;
          vec2 mouseOffset = uMouse * parallaxFactor;

          vec2 uv = (fragCoord.xy / uResolution.x) + mouseOffset + vec2(
            0.01 * sin((time + float(k * 6185)) * 0.6 + float(i)) * (5.0 / float(i)),
            downSpeed * (time + float(k * 1352)) * (1.0 / float(i))
          );

          vec2 uvStep = (ceil((uv) * cellSize - vec2(0.5, 0.5)) / cellSize);
          float x = fract(sin(dot(uvStep.xy, vec2(12.9898 + float(k) * 12.0, 78.233 + float(k) * 315.156))) * 43758.5453 + float(k) * 12.0) - 0.5;
          float y = fract(sin(dot(uvStep.xy, vec2(62.2364 + float(k) * 23.0, 94.674 + float(k) * 95.0))) * 62159.8432 + float(k) * 12.0) - 0.5;

          float randomMagnitude1 = sin(time * 2.5) * 0.7 / cellSize;
          float randomMagnitude2 = cos(time * 2.5) * 0.7 / cellSize;

          float d = 5.0 * distance((uvStep.xy + vec2(x * sin(y), y) * randomMagnitude1 + vec2(y, x) * randomMagnitude2), uv.xy);

          float omiVal = fract(sin(dot(uvStep.xy, vec2(32.4691, 94.615))) * 31572.1684);
          if(omiVal < 0.08) {
            float newd = (x + 1.0) * 0.4 * clamp(1.9 - d * (15.0 + (x * 6.3)) * (cellSize / 1.4), 0.0, 1.0);
            snow += newd;
          }
        }
      }

      // 调整最终颜色和透明度
      float alpha = snow * uIntensity;

      // 纯白色雪花
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `,
};

interface SnowParticlesProps {
  speed?: number;
  intensity?: number;
  /** 视差位置 ref，由父组件通过 Motion spring 更新 */
  parallaxRef?: MutableRefObject<{ x: number; y: number }>;
  /** 渲染的层范围 [start, end]，默认 [0, 5] 全部渲染 */
  layerRange?: [number, number];
}

export function SnowParticles({ speed = 1, intensity = 0.6, parallaxRef, layerRange = [0, 5] }: SnowParticlesProps) {
  const shaderMaterial = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uLayerStart: { value: layerRange[0] },
      uLayerEnd: { value: layerRange[1] },
    }),
    [size.width, size.height, speed, intensity, layerRange],
  );

  // 更新时间、分辨率和鼠标视差
  useFrame((state) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderMaterial.current.uniforms.uResolution.value.set(size.width, size.height);

      // 更新鼠标视差
      if (parallaxRef) {
        shaderMaterial.current.uniforms.uMouse.value.set(parallaxRef.current.x, parallaxRef.current.y);
      }
    }
  });

  return (
    <mesh>
      {/* 全屏四边形，覆盖整个视口 */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderMaterial}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={SnowShaderMaterial.vertexShader}
        fragmentShader={SnowShaderMaterial.fragmentShader}
      />
    </mesh>
  );
}
