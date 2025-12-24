import { useIsMobile } from '@hooks/useMediaQuery';
import { useStore } from '@nanostores/react';
import { Canvas } from '@react-three/fiber';
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';
import { christmasEnabled } from '@store/christmas';
import { SnowParticles } from './SnowParticles';

interface SnowfallCanvasProps {
  speed?: number;
  intensity?: number;
  mobileIntensity?: number;
  /** 视差强度，鼠标移动时的偏移量 (0-1)，默认 0.15 */
  parallaxStrength?: number;
  /** z-index，默认 50 */
  zIndex?: number;
  /** 渲染的层范围 [start, end]，默认 [0, 5] 全部渲染 */
  layerRange?: [number, number];
}

export function SnowfallCanvas({
  speed = 1,
  intensity = 0.6,
  mobileIntensity = 0.4,
  parallaxStrength = 0.15,
  zIndex = 50,
  layerRange = [0, 5],
}: SnowfallCanvasProps) {
  const isChristmasEnabled = useStore(christmasEnabled);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // 鼠标位置 motion values (标准化到 -0.5 ~ 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 使用 spring 平滑鼠标移动
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // 鼠标追踪 - 仅在桌面端启用
  useEffect(() => {
    // 移动端或减少动画时不需要鼠标视差
    if (isMobile || shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 标准化到 -0.5 ~ 0.5 范围
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      // 鼠标离开窗口时缓慢回到中心
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
    // mouseX/mouseY are stable refs from useMotionValue, no need in deps
  }, [isMobile, shouldReduceMotion]);

  const finalIntensity = isMobile ? mobileIntensity : intensity;
  const finalParallaxStrength = isMobile ? 0 : parallaxStrength;

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
        zIndex,
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
        <SnowParticlesWithParallax
          speed={speed}
          intensity={finalIntensity}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
          parallaxStrength={finalParallaxStrength}
          layerRange={layerRange}
        />
      </Canvas>
    </div>
  );
}

/** 内部组件：桥接 Motion spring 值和 R3F useFrame */
function SnowParticlesWithParallax({
  speed,
  intensity,
  smoothMouseX,
  smoothMouseY,
  parallaxStrength,
  layerRange,
}: {
  speed: number;
  intensity: number;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  parallaxStrength: number;
  layerRange: [number, number];
}) {
  const parallaxRef = useRef({ x: 0, y: 0 });

  // 订阅 spring 值的变化，存到 ref 中供 useFrame 使用
  useEffect(() => {
    const unsubX = smoothMouseX.on('change', (v) => {
      parallaxRef.current.x = v * parallaxStrength;
    });
    const unsubY = smoothMouseY.on('change', (v) => {
      parallaxRef.current.y = v * parallaxStrength;
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [smoothMouseX, smoothMouseY, parallaxStrength]);

  return <SnowParticles speed={speed} intensity={intensity} parallaxRef={parallaxRef} layerRange={layerRange} />;
}
