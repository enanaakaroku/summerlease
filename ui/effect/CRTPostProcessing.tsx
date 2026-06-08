"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

type CRTPostProcessingProps = {
  enabled?: boolean;
  curvature?: number;
  rgbOffset?: number;
  scanlineIntensity?: number;
  noiseIntensity?: number;
  vignetteIntensity?: number;
  tearIntensity?: number;
};

export default function CRTPostProcessing({
  enabled = true,
  curvature = 0.12,
  rgbOffset = 0.0025,
  scanlineIntensity = 0.16,
  noiseIntensity = 0.035,
  vignetteIntensity = 0.42,
  tearIntensity = 0.008,
}: CRTPostProcessingProps) {
  const { gl, scene, camera, size } = useThree();

  const composerRef = useRef<EffectComposer | null>(null);
  const shaderPassRef = useRef<ShaderPass | null>(null);

  const crtShader = useMemo(
    () => ({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(size.width, size.height),
        },
        uCurvature: { value: curvature },
        uRgbOffset: { value: rgbOffset },
        uScanlineIntensity: { value: scanlineIntensity },
        uNoiseIntensity: { value: noiseIntensity },
        uVignetteIntensity: { value: vignetteIntensity },
        uTearIntensity: { value: tearIntensity },
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vUv;

        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uCurvature;
        uniform float uRgbOffset;
        uniform float uScanlineIntensity;
        uniform float uNoiseIntensity;
        uniform float uVignetteIntensity;
        uniform float uTearIntensity;

        float random(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        vec2 curveUv(vec2 uv) {
          vec2 centered = uv * 2.0 - 1.0;

          vec2 offset = abs(centered.yx) * abs(centered.yx);
          centered += centered * offset * uCurvature;

          return centered * 0.5 + 0.5;
        }

        float horizontalTear(vec2 uv) {
          float band = floor(uv.y * 42.0);
          float n = random(vec2(band, floor(uTime * 9.0)));

          float tearMask = step(0.965, n);
          float direction = random(vec2(band, 2.0)) > 0.5 ? 1.0 : -1.0;

          return tearMask * direction * uTearIntensity;
        }

        void main() {
          vec2 uv = curveUv(vUv);

          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }

          uv.x += horizontalTear(uv);

          float wave = sin((uv.y * 70.0) + uTime * 8.0) * 0.0008;
          uv.x += wave;

          float offset = uRgbOffset;

          float r = texture2D(tDiffuse, uv + vec2(offset, 0.0)).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - vec2(offset, 0.0)).b;

          vec3 color = vec3(r, g, b);

          float scanline = sin((uv.y + uTime * 0.08) * uResolution.y * 1.25);
          color -= scanline * uScanlineIntensity * 0.18;

          float fineScanline = step(0.5, fract((uv.y + uTime * 0.035) * uResolution.y * 0.5));
          color *= mix(1.0, 0.86, fineScanline * uScanlineIntensity);

          float phosphor = mod(gl_FragCoord.x, 3.0);
          if (phosphor < 1.0) {
            color.r *= 1.08;
            color.g *= 0.92;
            color.b *= 0.92;
          } else if (phosphor < 2.0) {
            color.r *= 0.92;
            color.g *= 1.08;
            color.b *= 0.92;
          } else {
            color.r *= 0.92;
            color.g *= 0.92;
            color.b *= 1.08;
          }

          float noise = random(uv * uResolution.xy + uTime * 60.0);
          color += (noise - 0.5) * uNoiseIntensity;

          float dist = distance(uv, vec2(0.5));
          float vignette = smoothstep(0.82, 0.28, dist);
          color *= mix(1.0 - uVignetteIntensity, 1.0, vignette);

          float flicker = 1.0 + sin(uTime * 55.0) * 0.018;
          color *= flicker;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    }),
    [
      size.width,
      size.height,
      curvature,
      rgbOffset,
      scanlineIntensity,
      noiseIntensity,
      vignetteIntensity,
      tearIntensity,
    ],
  );

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    const shaderPass = new ShaderPass(crtShader);

    composer.addPass(renderPass);
    composer.addPass(shaderPass);

    composerRef.current = composer;
    shaderPassRef.current = shaderPass;

    return () => {
      composer.dispose();
      composerRef.current = null;
      shaderPassRef.current = null;
    };
  }, [gl, scene, camera, crtShader, size.width, size.height]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);

    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uResolution.value.set(
        size.width,
        size.height,
      );
    }
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (!enabled) return;
    if (!composerRef.current || !shaderPassRef.current) return;

    shaderPassRef.current.uniforms.uTime.value += delta;
    composerRef.current.render();
  }, 1);

  return null;
}
