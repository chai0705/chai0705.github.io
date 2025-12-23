import { useIsMobile } from '@hooks/useMediaQuery';
import { useStore } from '@nanostores/react';
import { Canvas } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import { christmasEnabled } from '@store/christmas';
import { SnowParticles } from './SnowParticles';

interface SnowfallCanvasProps {
  speed?: number;
  intensity?: number;
  mobileIntensity?: number;
}

export function SnowfallCanvas({ speed = 1, intensity = 0.6, mobileIntensity = 0.4 }: SnowfallCanvasProps) {
  const isChristmasEnabled = useStore(christmasEnabled);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const finalIntensity = isMobile ? mobileIntensity : intensity;

  // 如果用户偏好减少动画或圣诞特效被关闭，不渲染雪花
  if (shouldReduceMotion || !isChristmasEnabled) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <Canvas
        // 全屏着色器不需要透视相机，使用正交投影
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        dpr={[1, 1.5]}
        style={{
          background: 'transparent',
          pointerEvents: 'none',
        }}
        eventSource={undefined}
        eventPrefix={undefined}
      >
        <SnowParticles speed={speed} intensity={finalIntensity} />
      </Canvas>
    </div>
  );
}
