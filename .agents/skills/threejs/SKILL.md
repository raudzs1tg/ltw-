---
name: threejs
description: >-
  Use this skill when building, customizing, or optimizing interactive 3D WebGL scenes,
  3D product viewers, procedural 3D models (keyboards, mice, monitors, desk setups),
  lighting, shaders, and camera controls using Three.js in React applications.
---

# Three.js 3D WebGL Skill for PTIT Tech Store

This skill guides the creation and maintenance of interactive 3D scenes and product showcases in the React codebase using **Three.js** (`three`).

## Core Architecture & Guidelines

1. **Lifecycle & Memory Management in React (`useEffect`)**:
   - Always mount the `THREE.WebGLRenderer` canvas inside a `useRef` container.
   - Handle responsive resizing via a `ResizeObserver` or `window.addEventListener('resize', ...)` updating `camera.aspect` and `renderer.setSize()`.
   - In the `useEffect` cleanup function, always cancel `requestAnimationFrame`, remove event listeners, dispose geometries/materials (`geometry.dispose()`, `material.dispose()`), and call `renderer.dispose()`.
   - Guard WebGL initialization with a `try / catch` fallback so headless test environments (such as Jest / `jsdom` where WebGL context is unavailable) degrade gracefully without throwing errors.

2. **Procedural 3D Tech Gear Models**:
   - **Mechanical Keyboard 3D (`keyboard`)**: Extruded aluminum case (`BoxGeometry`), angled bezel, RGB underglow strip, and a grid of individual keycaps that animate on press or hover.
   - **Gaming Mouse 3D (`mouse`)**: Ergonomic contoured shell, scroll wheel (`CylinderGeometry`), and glowing RGB logo accent.
   - **4K / Ultrawide Monitor 3D (`monitor`)**: Slim bezel frame, glowing screen plane with code/cyberpunk colors, and V-stand or ergonomic arm.
   - **Studio Headphone / Audio 3D (`audio`)**: Curved headband (`TorusGeometry`) and dual earcups with metallic accents.

3. **Lighting & Theme Integration**:
   - Sync scene lighting and background particles with `ThemeContext` (`light` vs `dark`).
   - Combine `AmbientLight`, `DirectionalLight`, and colored `PointLight` (indigo `#6366f1`, pink `#ec4899`, cyan `#06b6d4`) for flagship cyberpunk depth.

4. **Interactive Controls**:
   - Support pointer drag / mouse parallax rotation and interactive mode switching (Auto-Rotate, Exploded View, RGB Wave, Wireframe).
