import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PlayerVisual3DProps {
  name: string;
  role: 'Batter' | 'Bowler';
  rank: number;
  teams: string[];
  ppiScore: number;
  className?: string;
}

export const PlayerVisual3D: React.FC<PlayerVisual3DProps> = ({
  name,
  role,
  rank,
  teams,
  ppiScore,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);
    camera.lookAt(0, 1.3, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Cinematic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    // Key front light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 4, 4);
    scene.add(keyLight);

    // Dramatic Rim Light 1: Rajasthan Royals Pink
    const rimLightPink = new THREE.SpotLight(0xea1a88, 7.0, 15, Math.PI / 3, 0.4, 1);
    rimLightPink.position.set(-3.5, 3.5, -2);
    rimLightPink.target.position.set(0, 1.3, 0);
    scene.add(rimLightPink);
    scene.add(rimLightPink.target);

    // Dramatic Rim Light 2: Cyber Blue / Cyan Fill
    const rimLightCyan = new THREE.SpotLight(0x06b6d4, 5.0, 15, Math.PI / 3, 0.4, 1);
    rimLightCyan.position.set(3.5, 2.8, -2);
    rimLightCyan.target.position.set(0, 1.3, 0);
    scene.add(rimLightCyan);
    scene.add(rimLightCyan.target);

    // Warm Gold Under-Pedestal Uplight
    const floorLight = new THREE.PointLight(rank === 1 ? 0xe5a93c : 0xea1a88, 3.5, 6);
    floorLight.position.set(0, 0.2, 0);
    scene.add(floorLight);

    // 4. Holographic Floor Pedestal
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Glowing base disc
    const discGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.08, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      metalness: 0.8,
      roughness: 0.2
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 0.04;
    pedestalGroup.add(disc);

    // Glowing Neon Ring Edge
    const ringGeo = new THREE.TorusGeometry(1.65, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: rank === 1 ? 0xe5a93c : 0xea1a88 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    pedestalGroup.add(ring);

    // Inner Tactical Crease Marker
    const innerRingGeo = new THREE.TorusGeometry(1.1, 0.015, 16, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.09;
    pedestalGroup.add(innerRing);

    // 5. Stylized 3D Sports-Game Athlete Model (Procedural Articulated Mesh)
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Materials
    const jerseyColor = rank === 1 ? 0x1e1b4b : (role === 'Batter' ? 0x0f172a : 0x091e3a);
    const jerseyAccent = rank === 1 ? 0xe5a93c : 0xea1a88;

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6, metalness: 0.1 });
    const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.4, metalness: 0.2 });
    const accentMat = new THREE.MeshStandardMaterial({ color: jerseyAccent, roughness: 0.3, metalness: 0.4 });
    const trouserMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.1 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
    const goldArmorMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.2, metalness: 0.8 });

    // Torso / Athletic Chest
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.95, 0.38);
    const torso = new THREE.Mesh(torsoGeo, jerseyMat);
    torso.position.set(0, 1.85, 0);
    playerGroup.add(torso);

    // Chest Team Stripe
    const stripeGeo = new THREE.BoxGeometry(0.74, 0.18, 0.39);
    const stripe = new THREE.Mesh(stripeGeo, accentMat);
    stripe.position.set(0, 1.95, 0);
    playerGroup.add(stripe);

    // Player Number Badge on Chest
    const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24);
    const badgeMat = new THREE.MeshBasicMaterial({ color: rank === 1 ? 0xe5a93c : 0xffffff });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, 1.95, 0.2);
    playerGroup.add(badge);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.18, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 2.4, 0);
    playerGroup.add(neck);

    // Head / Cricket Helmet
    const helmetGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const helmet = new THREE.Mesh(helmetGeo, jerseyMat);
    helmet.position.set(0, 2.62, 0.04);
    playerGroup.add(helmet);

    // Helmet Peak / Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.04, 0.18);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.65, 0.22);
    visor.rotation.x = 0.2;
    playerGroup.add(visor);

    // Face Grille (Steel Wireframe)
    const grilleGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.18, 16, 3, true);
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 2.5, 0.14);
    playerGroup.add(grille);

    // Shoulders
    [-0.48, 0.48].forEach(x => {
      const shGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const sh = new THREE.Mesh(shGeo, accentMat);
      sh.position.set(x, 2.22, 0);
      playerGroup.add(sh);
    });

    if (role === 'Batter') {
      // Dynamic Power-Hitting Batting Stance (Cocked Bat, Athletic Bend)
      // Left Arm (Top hand on bat)
      const armLGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.6, 12);
      const armL = new THREE.Mesh(armLGeo, jerseyMat);
      armL.position.set(-0.46, 1.85, 0.15);
      armL.rotation.set(-0.4, 0.2, 0.5);
      playerGroup.add(armL);

      // Right Arm (Bottom hand driving forward)
      const armRGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.6, 12);
      const armR = new THREE.Mesh(armRGeo, jerseyMat);
      armR.position.set(0.38, 1.85, 0.22);
      armR.rotation.set(-0.8, -0.3, -0.4);
      playerGroup.add(armR);

      // Batting Gloves (Gold or RR Pink)
      [-0.15, 0.08].forEach(x => {
        const gloveGeo = new THREE.BoxGeometry(0.16, 0.18, 0.14);
        const glove = new THREE.Mesh(gloveGeo, accentMat);
        glove.position.set(x, 1.62, 0.35);
        playerGroup.add(glove);
      });

      // Professional Cricket Bat (English Willow Blade, Rubber Grip Handle)
      const batHandleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 12);
      const batHandleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const batHandle = new THREE.Mesh(batHandleGeo, batHandleMat);
      batHandle.position.set(0, 1.7, 0.36);
      batHandle.rotation.set(-0.6, 0.3, -0.2);
      playerGroup.add(batHandle);

      // Bat Blade (Willow Wood)
      const batBladeGeo = new THREE.BoxGeometry(0.24, 0.95, 0.08);
      const batBladeMat = new THREE.MeshStandardMaterial({
        color: 0xd9b382,
        roughness: 0.3,
        metalness: 0.1
      });
      const batBlade = new THREE.Mesh(batBladeGeo, batBladeMat);
      batBlade.position.set(-0.15, 1.15, 0.55);
      batBlade.rotation.set(-0.6, 0.3, -0.2);
      playerGroup.add(batBlade);

      // Bat Sticker
      const stickerGeo = new THREE.BoxGeometry(0.18, 0.35, 0.09);
      const sticker = new THREE.Mesh(stickerGeo, accentMat);
      sticker.position.set(-0.15, 1.35, 0.55);
      sticker.rotation.set(-0.6, 0.3, -0.2);
      playerGroup.add(sticker);

      // Legs with Batting Pads (Shin Guards)
      [-0.22, 0.22].forEach(x => {
        // Thigh
        const thighGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.65, 12);
        const thigh = new THREE.Mesh(thighGeo, trouserMat);
        thigh.position.set(x, 1.15, 0);
        playerGroup.add(thigh);

        // Batting Pad
        const padGeo = new THREE.BoxGeometry(0.26, 0.75, 0.2);
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(x, 0.45, 0.05);
        playerGroup.add(pad);

        // Pad Straps (Gold Accent)
        const strapGeo = new THREE.BoxGeometry(0.27, 0.04, 0.21);
        const strap = new THREE.Mesh(strapGeo, accentMat);
        strap.position.set(x, 0.48, 0.05);
        playerGroup.add(strap);
      });
    } else {
      // Dynamic Bowler Delivery Action Stride
      // Bowling Arm (High release vertical extension)
      const armRGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.75, 12);
      const armR = new THREE.Mesh(armRGeo, jerseyMat);
      armR.position.set(0.38, 2.45, 0.1);
      armR.rotation.set(0.1, 0, 0.2);
      playerGroup.add(armR);

      // Cricket Ball in Seam Release Grip (Crimson Leather with White Seam)
      const ballGeo = new THREE.SphereGeometry(0.09, 20, 20);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.2, metalness: 0.3 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0.48, 2.85, 0.14);
      playerGroup.add(ball);

      // Ball White Seam Ring
      const seamGeo = new THREE.TorusGeometry(0.092, 0.008, 12, 32);
      const seamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.position.copy(ball.position);
      seam.rotation.y = Math.PI / 4;
      playerGroup.add(seam);

      // Non-Bowling Arm (Forward leverage gather)
      const armLGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.6, 12);
      const armL = new THREE.Mesh(armLGeo, jerseyMat);
      armL.position.set(-0.42, 1.8, 0.25);
      armL.rotation.set(-1.0, 0.3, 0.6);
      playerGroup.add(armL);

      // Bowler Legs (Athletic Jump Stride)
      const legRGeo = new THREE.CylinderGeometry(0.16, 0.12, 1.1, 12);
      const legR = new THREE.Mesh(legRGeo, trouserMat);
      legR.position.set(0.24, 0.7, -0.1);
      legR.rotation.x = -0.3;
      playerGroup.add(legR);

      const legLGeo = new THREE.CylinderGeometry(0.16, 0.12, 1.05, 12);
      const legL = new THREE.Mesh(legLGeo, trouserMat);
      legL.position.set(-0.24, 0.75, 0.2);
      legL.rotation.x = 0.4;
      playerGroup.add(legL);
    }

    // Cricket Spikes (Shoes)
    [-0.22, 0.22].forEach(x => {
      const shoeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.36);
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(x, 0.08, 0.04);
      playerGroup.add(shoe);
    });

    // 6. Floating Particles Around Player (Clutch Energy Field)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 45;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 3.5;
      posArray[i + 1] = Math.random() * 3.2;
      posArray[i + 2] = (Math.random() - 0.5) * 3.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: rank === 1 ? 0xe5a93c : 0xea1a88,
      transparent: true,
      opacity: 0.7
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking for subtle parallax tilt
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };
    container.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop (Breathing + Parallax)
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle breathing float (vertical oscillation)
      const floatY = Math.sin(elapsedTime * 1.8) * 0.05;
      playerGroup.position.y = floatY;

      // Smooth mouse-follow parallax rotation (capped)
      const targetRotY = mouseRef.current.x * 0.25;
      const targetRotX = -mouseRef.current.y * 0.12;
      playerGroup.rotation.y += (targetRotY - playerGroup.rotation.y) * 0.05;
      playerGroup.rotation.x += (targetRotX - playerGroup.rotation.x) * 0.05;

      // Slow spinning halo ring on floor
      ring.rotation.z += 0.01;
      innerRing.rotation.z -= 0.007;

      // Floating particles rise
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [name, role, rank, ppiScore]);

  return (
    <div className={`relative w-full h-full min-h-[460px] flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full select-none cursor-grab active:cursor-grabbing" />
    </div>
  );
};
