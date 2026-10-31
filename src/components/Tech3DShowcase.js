import { useEffect, useRef, useState, useContext } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ThemeContext } from '../context/ThemeContext';

const MODEL_TABS = [
  { id: 'keyboard', label: '⌨️ Bàn Phím Cơ 75%', desc: 'Gasket Mount 5 lớp • Keycap PBT • RGB 16.8M' },
  { id: 'mouse', label: '🖱️ Chuột 8KHz 49g', desc: 'Siêu nhẹ đối xứng • Cảm biến 26.000 DPI' },
  { id: 'monitor', label: '🖥️ Màn 4K + Screenbar', desc: 'Tấm nền IPS 165Hz • Đèn chống cận Ra98' },
  { id: 'audio', label: '🎧 Tai Nghe ANC Pro', desc: 'Chống ồn -45dB • Âm thanh vòm 360°' },
];

const COLOR_THEMES = [
  { id: 'cyber', label: 'Tím Cyberpunk', body: 0x312e81, accent: 0xec4899, keycap: 0x4f46e5 },
  { id: 'carbon', label: 'Đen Carbon', body: 0x1e293b, accent: 0x6366f1, keycap: 0x334155 },
  { id: 'retro', label: 'Trắng Retro', body: 0xe2e8f0, accent: 0x10b981, keycap: 0xffffff },
];

export default function Tech3DShowcase({ initialModel = 'keyboard', compact = false }) {
  const { theme } = useContext(ThemeContext);
  const mountRef = useRef(null);
  const panelRef = useRef(null);
  const modelGroupRef = useRef(null);
  const keycapsRef = useRef([]);
  const explodedPartsRef = useRef([]);

  const [activeModel, setActiveModel] = useState(initialModel);
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [isExploded, setIsExploded] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setActiveModel(initialModel);
  }, [initialModel]);

  // GSAP Entrance Animation cho khung điều khiển 3D
  useEffect(() => {
    if (!panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.showcase-animate-item',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.out',
        }
      );
    }, panelRef);
    return () => ctx.revert();
  }, []);

  // Khởi tạo và dựng cảnh Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || (compact ? 250 : 320);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 6.2);
    camera.lookAt(0, 0, 0);

    // Hệ thống ánh sáng Studio
    const ambientLight = new THREE.AmbientLight(
      theme === 'dark' ? 0xffffff : 0xf8fafc,
      theme === 'dark' ? 0.85 : 1.15
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(colorTheme.accent, 2.5, 14);
    pointLight1.position.set(-3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 14);
    pointLight2.position.set(3, -1, 2);
    scene.add(pointLight2);

    // Hạt năng lượng không gian 3D
    const particleCount = 90;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: colorTheme.accent,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Nhóm chứa mô hình sản phẩm 3D
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    keycapsRef.current = [];
    explodedPartsRef.current = [];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorTheme.body,
      roughness: 0.3,
      metalness: 0.5,
      wireframe: isWireframe,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: colorTheme.accent,
      emissive: colorTheme.accent,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      wireframe: isWireframe,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: colorTheme.keycap,
      roughness: 0.4,
      metalness: 0.2,
      wireframe: isWireframe,
    });

    if (activeModel === 'keyboard') {
      // Khung đáy nhôm CNC
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 1.8), bodyMat);
      baseMesh.position.y = -0.2;
      modelGroup.add(baseMesh);
      explodedPartsRef.current.push({ mesh: baseMesh, baseY: -0.2, explodeY: -0.9 });

      // Dải LED RGB Underglow
      const rgbPlate = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.08, 1.65), accentMat);
      rgbPlate.position.y = 0.02;
      modelGroup.add(rgbPlate);
      explodedPartsRef.current.push({ mesh: rgbPlate, baseY: 0.02, explodeY: 0 });

      // Hàng nút Keycap 3D
      const cols = 12;
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isAccentKey = (r === 0 && c === 0) || (r === 2 && c === 11) || (r === 3 && c >= 4 && c <= 7);
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.18, 0.26),
            isAccentKey ? accentMat : keyMat
          );
          const x = -1.75 + c * 0.315;
          const z = -0.52 + r * 0.34;
          const baseY = 0.16;
          cap.position.set(x, baseY, z);
          modelGroup.add(cap);
          keycapsRef.current.push({ mesh: cap, baseY, phase: (c + r) * 0.45 });
          explodedPartsRef.current.push({ mesh: cap, baseY, explodeY: 0.75 + (r % 2) * 0.18 });
        }
      }

      // Núm xoay âm lượng CNC góc trên phải
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 24), accentMat);
      knob.position.set(1.82, 0.2, -0.52);
      modelGroup.add(knob);
      explodedPartsRef.current.push({ mesh: knob, baseY: 0.2, explodeY: 1.05 });
    } else if (activeModel === 'mouse') {
      // Thân chuột công thái học
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2.5), bodyMat);
      body.position.y = -0.05;
      modelGroup.add(body);
      explodedPartsRef.current.push({ mesh: body, baseY: -0.05, explodeY: -0.6 });

      // Nút bấm Trái & Phải
      const leftClick = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 1.05), keyMat);
      leftClick.position.set(-0.38, 0.28, -0.65);
      modelGroup.add(leftClick);
      explodedPartsRef.current.push({ mesh: leftClick, baseY: 0.28, explodeY: 0.85 });

      const rightClick = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 1.05), keyMat);
      rightClick.position.set(0.38, 0.28, -0.65);
      modelGroup.add(rightClick);
      explodedPartsRef.current.push({ mesh: rightClick, baseY: 0.28, explodeY: 0.85 });

      // Con lăn Scroll Wheel RGB
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), accentMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.34, -0.7);
      modelGroup.add(wheel);
      explodedPartsRef.current.push({ mesh: wheel, baseY: 0.34, explodeY: 1.1 });

      // Dải LED đuôi chuột
      const tailRgb = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.35), accentMat);
      tailRgb.position.set(0, -0.22, 1.1);
      modelGroup.add(tailRgb);
      explodedPartsRef.current.push({ mesh: tailRgb, baseY: -0.22, explodeY: -0.95 });
    } else if (activeModel === 'monitor') {
      // Tấm nền Màn hình 4K
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.4, 0.16), bodyMat);
      frame.position.set(0, 0.55, 0);
      modelGroup.add(frame);
      explodedPartsRef.current.push({ mesh: frame, baseY: 0.55, explodeY: 0.55 });

      const display = new THREE.Mesh(new THREE.BoxGeometry(4.15, 2.15, 0.06), keyMat);
      display.position.set(0, 0.55, 0.1);
      modelGroup.add(display);
      explodedPartsRef.current.push({ mesh: display, baseY: 0.55, explodeY: 0.9 });

      // Đèn treo màn hình Screenbar trên đỉnh
      const screenbar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 20), accentMat);
      screenbar.rotation.z = Math.PI / 2;
      screenbar.position.set(0, 1.85, 0.22);
      modelGroup.add(screenbar);
      explodedPartsRef.current.push({ mesh: screenbar, baseY: 1.85, explodeY: 2.35 });

      // Chân đế Arm Ergonomic
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 20), bodyMat);
      pillar.position.set(0, -0.5, -0.25);
      modelGroup.add(pillar);

      const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.1), accentMat);
      standBase.position.set(0, -1.25, -0.1);
      modelGroup.add(standBase);
    } else if (activeModel === 'audio') {
      // Vòm tai nghe Studio
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.12, 16, 48, Math.PI), bodyMat);
      arc.position.set(0, 0.2, 0);
      modelGroup.add(arc);
      explodedPartsRef.current.push({ mesh: arc, baseY: 0.2, explodeY: 0.75 });

      // Hai củ tai ANC
      const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 32), keyMat);
      leftCup.rotation.z = Math.PI / 2;
      leftCup.position.set(-1.2, -0.1, 0);
      modelGroup.add(leftCup);

      const rightCup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 32), keyMat);
      rightCup.rotation.z = Math.PI / 2;
      rightCup.position.set(1.2, -0.1, 0);
      modelGroup.add(rightCup);

      // Vòng LED Neon hai bên
      const leftRing = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 32), accentMat);
      leftRing.rotation.z = Math.PI / 2;
      leftRing.position.set(-1.38, -0.1, 0);
      modelGroup.add(leftRing);

      const rightRing = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 32), accentMat);
      rightRing.rotation.z = Math.PI / 2;
      rightRing.position.set(1.38, -0.1, 0);
      modelGroup.add(rightRing);
    }

    // Hiệu ứng GSAP pop-in khi đổi mô hình 3D
    gsap.fromTo(
      modelGroup.scale,
      { x: 0.65, y: 0.65, z: 0.65 },
      { x: 1, y: 1, z: 1, duration: 0.65, ease: 'back.out(1.6)' }
    );
    gsap.fromTo(
      modelGroup.rotation,
      { y: -0.6, x: 0.25 },
      { y: 0.35, x: 0.12, duration: 0.75, ease: 'power3.out' }
    );

    // Kéo chuột để xoay mô hình 3D
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      modelGroup.rotation.y += dx * 0.01;
      modelGroup.rotation.x = Math.max(-0.6, Math.min(0.8, modelGroup.rotation.x + dy * 0.008));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let animFrameId;
    let clock = 0;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      clock += 0.03;

      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.0065;
      }

      // Sóng gõ phím cơ (Keycap wave) khi không ở chế độ bung linh kiện
      if (activeModel === 'keyboard' && !isExploded) {
        keycapsRef.current.forEach((kc) => {
          kc.mesh.position.y = kc.baseY + Math.sin(clock * 2 + kc.phase) * 0.035;
        });
      }

      particles.rotation.y -= 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || (compact ? 250 : 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeModel, colorTheme, isWireframe, autoRotate, isExploded, theme, compact]);

  // Dùng GSAP để bung / đóng các lớp linh kiện 3D (Exploded View)
  const toggleExplodeView = () => {
    const nextState = !isExploded;
    setIsExploded(nextState);
    explodedPartsRef.current.forEach((part) => {
      gsap.to(part.mesh.position, {
        y: nextState ? part.explodeY : part.baseY,
        duration: 0.65,
        ease: 'power3.inOut',
      });
    });
  };

  // Dùng GSAP xoay nhanh 360 độ
  const triggerSpin360 = () => {
    if (!modelGroupRef.current) return;
    gsap.to(modelGroupRef.current.rotation, {
      y: modelGroupRef.current.rotation.y + Math.PI * 2,
      duration: 0.9,
      ease: 'power2.inOut',
    });
  };

  const currentTabInfo = MODEL_TABS.find((t) => t.id === activeModel) || MODEL_TABS[0];

  return (
    <section className="tech-3d-showcase" ref={panelRef}>
      <div className="showcase-top-bar showcase-animate-item">
        <div>
          <div className="showcase-badge-row">
            <span className="showcase-webgl-pill">🧊 THREE.JS WEBGL 3D LAB</span>
            <span className="showcase-gsap-pill">✨ GSAP MOTION ENGINE</span>
          </div>
          <h3 className="section-title" style={{ marginTop: '4px' }}>
            Phòng Thử Nghiệm Gear 3D Tương Tác 360°
          </h3>
          <p className="section-subtitle">
            Kéo chuột trực tiếp trên mô hình để xoay 360°, bung lớp cấu tạo Gasket Mount hoặc
            thử phối màu Custom theo sở thích của bạn
          </p>
        </div>

        <div className="showcase-model-tabs showcase-animate-item">
          {MODEL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`model-3d-tab ${activeModel === tab.id ? 'active' : ''}`}
              onClick={() => {
                setIsExploded(false);
                setActiveModel(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="showcase-stage-wrapper showcase-animate-item">
        {/* Khung Canvas 3D Three.js */}
        <div
          className="threejs-canvas-box"
          ref={mountRef}
          style={{ height: compact ? '250px' : '310px' }}
          title="Kéo chuột để xoay mô hình 3D"
        >
          {!webglSupported && (
            <div className="webgl-fallback-box">
              <span>🧊 Mô hình 3D Interactive ({currentTabInfo.label})</span>
            </div>
          )}
        </div>

        {/* Thanh điều khiển hiệu ứng GSAP + Three.js nổi trên sân khấu */}
        <div className="showcase-controls-overlay">
          <div className="showcase-active-meta">
            <strong>{currentTabInfo.label}</strong>
            <span>{currentTabInfo.desc}</span>
          </div>

          <div className="showcase-color-swatches">
            <span className="swatch-label">Phối màu 3D:</span>
            {COLOR_THEMES.map((ct) => (
              <button
                key={ct.id}
                type="button"
                className={`swatch-btn ${colorTheme.id === ct.id ? 'active' : ''}`}
                onClick={() => setColorTheme(ct)}
              >
                {ct.label}
              </button>
            ))}
          </div>

          <div className="showcase-action-btns">
            <button
              type="button"
              className={`ctrl-3d-btn ${isExploded ? 'active' : ''}`}
              onClick={toggleExplodeView}
            >
              {isExploded ? '🧩 Đóng linh kiện' : '💥 Bung lớp cấu tạo (GSAP)'}
            </button>
            <button
              type="button"
              className={`ctrl-3d-btn ${isWireframe ? 'active' : ''}`}
              onClick={() => setIsWireframe((w) => !w)}
            >
              🕸️ Khung dây Wireframe
            </button>
            <button
              type="button"
              className={`ctrl-3d-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate((r) => !r)}
            >
              {autoRotate ? '⏸ Dừng xoay' : '▶ Tự xoay'}
            </button>
            <button type="button" className="ctrl-3d-btn" onClick={triggerSpin360}>
              🔄 Xoay 360°
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
