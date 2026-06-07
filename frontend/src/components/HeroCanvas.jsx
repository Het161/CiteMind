import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroCanvas — programmatic Three.js molecular network
 * Chemistry-themed: central node + orbiting satellites connected by edges.
 * Reacts to mouse movement with gentle parallax.
 */
export default function HeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    // ── Materials ─────────────────────────────────────────────────────
    const tealMat   = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const grapeMat  = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
    const neonMat   = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.7 });
    const lineMat   = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.35 });
    const grapeLineMat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.25 });

    // ── Geometry helpers ──────────────────────────────────────────────
    const sphere = (r) => new THREE.SphereGeometry(r, 16, 16);

    // ── Central node ──────────────────────────────────────────────────
    const centralNode = new THREE.Mesh(sphere(0.22), tealMat);
    scene.add(centralNode);

    // Pulse ring around central
    const ringGeo = new THREE.RingGeometry(0.32, 0.36, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    // ── Orbital satellites ────────────────────────────────────────────
    const ORBITS = [
      { radius: 1.9, speed: 0.28, yOffset: 0.4,  size: 0.12, mat: grapeMat,  phaseOffset: 0 },
      { radius: 1.9, speed: 0.28, yOffset: 0.4,  size: 0.12, mat: grapeMat,  phaseOffset: Math.PI * 0.67 },
      { radius: 1.9, speed: 0.28, yOffset: 0.4,  size: 0.12, mat: grapeMat,  phaseOffset: Math.PI * 1.33 },
      { radius: 2.8, speed: 0.15, yOffset: -0.3, size: 0.1,  mat: neonMat,   phaseOffset: 0.3 },
      { radius: 2.8, speed: 0.15, yOffset: -0.3, size: 0.1,  mat: neonMat,   phaseOffset: Math.PI },
      { radius: 3.6, speed: 0.09, yOffset: 0.1,  size: 0.08, mat: grapeMat,  phaseOffset: 1.0 },
      { radius: 3.6, speed: 0.09, yOffset: 0.1,  size: 0.08, mat: grapeMat,  phaseOffset: 2.5 },
      { radius: 3.6, speed: 0.09, yOffset: 0.1,  size: 0.08, mat: grapeMat,  phaseOffset: 4.2 },
    ];

    const satellites = ORBITS.map((o) => {
      const mesh = new THREE.Mesh(sphere(o.size), o.mat);
      scene.add(mesh);
      return { mesh, ...o };
    });

    // ── Edges (lines from center to each satellite) ───────────────────
    const edges = satellites.map((s) => {
      const geo = new THREE.BufferGeometry();
      const pts = new Float32Array(6); // 2 points × 3 coords
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const mat = s.mat === grapeMat ? grapeLineMat : lineMat;
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      return { line, pts };
    });

    // ── Secondary cross-edges between nearby satellites ───────────────
    const crossEdges = [
      [0, 1], [1, 2], [2, 0],   // inner trio
      [3, 4],                     // mid pair
    ].map(([ai, bi]) => {
      const geo = new THREE.BufferGeometry();
      const pts = new Float32Array(6);
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const line = new THREE.Line(geo, grapeLineMat);
      scene.add(line);
      return { line, pts, ai, bi };
    });

    // ── Floating dust particles ───────────────────────────────────────
    const PARTICLE_COUNT = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2dd4bf,
      size: 0.025,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Mouse parallax ────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    container.addEventListener('mousemove', onMouse);

    // ── Resize handler ────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Central node gentle bob + pulse ring
      centralNode.position.y = Math.sin(t * 0.8) * 0.05;
      ring.rotation.z = t * 0.4;
      ring.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
      ringMat.opacity = 0.25 + Math.sin(t * 1.5) * 0.15;

      // Satellite positions
      satellites.forEach((s, i) => {
        const angle = t * s.speed + s.phaseOffset;
        s.mesh.position.set(
          Math.cos(angle) * s.radius,
          s.yOffset + Math.sin(t * 0.4 + i) * 0.15,
          Math.sin(angle) * s.radius * 0.4
        );
      });

      // Update radial edges
      edges.forEach(({ line, pts }, i) => {
        const sat = satellites[i];
        pts[0] = 0; pts[1] = 0; pts[2] = 0;
        pts[3] = sat.mesh.position.x;
        pts[4] = sat.mesh.position.y;
        pts[5] = sat.mesh.position.z;
        line.geometry.attributes.position.needsUpdate = true;
      });

      // Update cross-edges
      crossEdges.forEach(({ line, pts, ai, bi }) => {
        const a = satellites[ai].mesh.position;
        const b = satellites[bi].mesh.position;
        pts[0] = a.x; pts[1] = a.y; pts[2] = a.z;
        pts[3] = b.x; pts[4] = b.y; pts[5] = b.z;
        line.geometry.attributes.position.needsUpdate = true;
      });

      // Particles slow drift
      particles.rotation.y = t * 0.02;
      particles.rotation.x = t * 0.01;

      // Camera parallax on mouse
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouse);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero-canvas-wrapper"
      aria-hidden="true"
    />
  );
}
