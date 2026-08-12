import React, { useEffect, useRef } from "react";

/**
 * WebGL "Mesh drift" shader background.
 * Renders a fullscreen triangle in WebGL1 — no libraries, minimal memory.
 * Pauses RAF when tab is hidden. Caps DPR at 2.
 *
 * Props:
 *  - colors: array of 4 [r,g,b] values (0–1 range)
 *  - speed: 0–1 (default 0.33)
 *  - style: optional CSS override
 */

export interface ShaderBackgroundProps {
  colors?: [number, number, number][];
  speed?: number;
  intensity?: number;
  style?: React.CSSProperties;
}

// Default dark ocean palette
const DEFAULT_COLORS: [number, number, number][] = [
  [0.0, 0.071, 0.098],   // #001219
  [0.0, 0.373, 0.451],   // #005F73
  [0.58, 0.824, 0.741],  // #94D2BD
  [0.914, 0.847, 0.651], // #E9D8A6
];

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;
uniform vec4 u_shape;
uniform vec4 u_surface;
uniform vec4 u_finish;
uniform vec4 u_transform;
uniform vec4 u_space;
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec3 acc = u_colors[0] * 0.15;
  float total = 0.15;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_colorCount) break;
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.21 + fi * 0.071) + fi * 2.4 + u_seed),
      cos(t * (0.17 + fi * 0.093) + fi * 1.7)
    ) * (0.45 + u_intensity * 0.35);
    float w = exp(-dot(p - c, p - c) * 6.0);
    acc += u_colors[i] * w;
    total += w;
  }
  return acc / total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
           / min(u_resolution.x, u_resolution.y);

  p *= u_scale;

  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }

  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));

  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))
    ) - 0.5);
  }

  vec3 col = shade(uv, p, u_time);

  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;

  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }

  if (abs(u_brightness) > 0.0001)
    col += u_brightness;

  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }

  if (u_grain > 0.0001)
    col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({
  colors = DEFAULT_COLORS,
  speed = 0.33,
  intensity = 0.54,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT_SRC);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG_SRC);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const loc = {
      colors: gl.getUniformLocation(prog, "u_colors"),
      scene: gl.getUniformLocation(prog, "u_scene"),
      shape: gl.getUniformLocation(prog, "u_shape"),
      surface: gl.getUniformLocation(prog, "u_surface"),
      finish: gl.getUniformLocation(prog, "u_finish"),
      transform: gl.getUniformLocation(prog, "u_transform"),
      space: gl.getUniformLocation(prog, "u_space"),
      cursor: gl.getUniformLocation(prog, "u_cursor"),
    };

    // Set static uniforms
    const colorArr = new Float32Array(24); // 8 * 3
    for (let i = 0; i < 4; i++) {
      const c = colors[i] || [0, 0, 0];
      colorArr[i * 3] = c[0];
      colorArr[i * 3 + 1] = c[1];
      colorArr[i * 3 + 2] = c[2];
    }
    gl.uniform3fv(loc.colors, colorArr);
    gl.uniform4f(loc.shape, 2.0, intensity, 0.47, 0.04); // scale, intensity, paramA, warp
    gl.uniform4f(loc.surface, 1.54, 1.16, 0.0, 1.0); // detail, contrast, brightness, saturation
    gl.uniform4f(loc.finish, 0.0, 0.21, 0.002, 0.10); // hue, vignette, blur, grain
    gl.uniform4f(loc.transform, 4012.0, 5.65, 0.12, 0.0); // seed, rotation, drift, oklab
    gl.uniform4f(loc.space, 0.11, -0.19, 0.0, 0.0); // offset, pointer
    gl.uniform4f(loc.cursor, 0.0, 2.0, 0.65, 0.46); // cursor off

    // Resize
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Animation loop
    let running = true;
    const startTime = performance.now();

    const frame = () => {
      if (!running) return;
      const t = (performance.now() - startTime) * 0.001 * speed * -0.73;
      gl.uniform4f(loc.scene, canvas.width, canvas.height, t, 4.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    };

    // Pause when hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        rafRef.current = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [colors, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Preset color palettes for different pages
// ─────────────────────────────────────────────────────────────────────────────

export const SHADER_PALETTES = {
  // Deep ocean (landing / default)
  ocean: [
    [0.0, 0.071, 0.098],
    [0.0, 0.373, 0.451],
    [0.58, 0.824, 0.741],
    [0.914, 0.847, 0.651],
  ] as [number, number, number][],

  // Midnight purple (features)
  midnight: [
    [0.02, 0.0, 0.08],
    [0.15, 0.0, 0.35],
    [0.4, 0.1, 0.65],
    [0.7, 0.3, 0.9],
  ] as [number, number, number][],

  // Monochrome (architecture)
  mono: [
    [0.0, 0.0, 0.0],
    [0.12, 0.12, 0.14],
    [0.28, 0.28, 0.32],
    [0.5, 0.5, 0.55],
  ] as [number, number, number][],

  // Warm ember (demo)
  ember: [
    [0.06, 0.0, 0.0],
    [0.3, 0.05, 0.0],
    [0.7, 0.2, 0.05],
    [1.0, 0.6, 0.2],
  ] as [number, number, number][],

  // Green circuit (app)
  circuit: [
    [0.0, 0.04, 0.02],
    [0.0, 0.2, 0.1],
    [0.1, 0.5, 0.3],
    [0.3, 0.85, 0.5],
  ] as [number, number, number][],
} as const;
