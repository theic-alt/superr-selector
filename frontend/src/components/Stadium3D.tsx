import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Eye, RotateCw, Play, Pause, Zap } from 'lucide-react';

interface Stadium3DProps {
  interactive?: boolean;
  activeScenario?: 'yorker' | 'six' | 'spin' | 'all';
  height?: string;
  showControls?: boolean;
}

export const Stadium3D: React.FC<Stadium3DProps> = ({
  interactive = true,
  activeScenario = 'all',
  height = '500px',
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'broadcast' | 'pitch' | 'tactical'>('broadcast');
  const [isRotating, setIsRotating] = useState(true);
  const [activeTraj, setActiveTraj] = useState<'yorker' | 'six' | 'spin' | 'all'>(activeScenario);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const heightPx = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a10);
    scene.fog = new THREE.FogExp2(0x070a10, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 32, 60);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2639, 0.8);
    scene.add(ambientLight);

    const centralLight = new THREE.PointLight(0xea1a88, 2, 80);
    centralLight.position.set(0, 15, 0);
    scene.add(centralLight);

    // 4 Stadium Floodlight Towers (at 4 diagonals)
    const towerPositions = [
      { x: -55, z: -55, color: 0xffffff },
      { x: 55, z: -55, color: 0xffffff },
      { x: -55, z: 55, color: 0xffffff },
      { x: 55, z: 55, color: 0xffffff }
    ];

    towerPositions.forEach(t => {
      const spot = new THREE.SpotLight(t.color, 4, 140, Math.PI / 4, 0.3, 1);
      spot.position.set(t.x, 35, t.z);
      spot.target.position.set(0, 0, 0);
      scene.add(spot);
      scene.add(spot.target);

      // Floodlight tower lattice representation
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.8, 35, 6);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0x1f293d, wireframe: true });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(t.x, 17.5, t.z);
      scene.add(pole);

      // Light head
      const headGeo = new THREE.BoxGeometry(4, 3, 2);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xe5a93c });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(t.x, 35, t.z);
      head.lookAt(0, 0, 0);
      scene.add(head);
    });

    // 4. Ground & Field (Oval)
    const groundGeo = new THREE.CylinderGeometry(50, 52, 1, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c1420,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    scene.add(ground);

    // Stadium Boundary Ring (Glowing Rajasthan Royals Pink)
    const ringGeo = new THREE.TorusGeometry(46, 0.35, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xea1a88 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    scene.add(ring);

    // 30-Yard Circle Marker (Subtle Cyan Ring)
    const thirtyYardGeo = new THREE.TorusGeometry(22, 0.15, 16, 80);
    const thirtyYardMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const thirtyYard = new THREE.Mesh(thirtyYardGeo, thirtyYardMat);
    thirtyYard.rotation.x = Math.PI / 2;
    thirtyYard.position.y = 0.03;
    scene.add(thirtyYard);

    // 5. Cricket Pitch (Center rectangle: 22 yards / length: 20.12m, width: 3.05m -> scaled to 22 x 4)
    const pitchGeo = new THREE.PlaneGeometry(5, 24);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b2c,
      roughness: 0.9,
      metalness: 0.1
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.02;
    scene.add(pitch);

    // Crease Lines (Popping creases & bowling creases at both ends)
    const createCrease = (zPos: number) => {
      const creaseGeo = new THREE.PlaneGeometry(4.8, 0.12);
      const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const crease = new THREE.Mesh(creaseGeo, creaseMat);
      crease.rotation.x = -Math.PI / 2;
      crease.position.set(0, 0.03, zPos);
      scene.add(crease);
    };
    createCrease(10);
    createCrease(8.8); // Bowling & popping crease North
    createCrease(-10);
    createCrease(-8.8); // Bowling & popping crease South

    // Stumps & Bails (3 Stumps at each end)
    const createStumps = (zPos: number) => {
      const group = new THREE.Group();
      [-0.4, 0, 0.4].forEach(xOff => {
        const stumpGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12);
        const stumpMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6 });
        const stump = new THREE.Mesh(stumpGeo, stumpMat);
        stump.position.set(xOff, 0.7, 0);
        group.add(stump);
      });
      // Bail
      const bailGeo = new THREE.BoxGeometry(1.05, 0.05, 0.05);
      const bailMat = new THREE.MeshBasicMaterial({ color: 0xe5a93c });
      const bail = new THREE.Mesh(bailGeo, bailMat);
      bail.position.set(0, 1.42, 0);
      group.add(bail);

      group.position.set(0, 0, zPos);
      scene.add(group);
    };
    createStumps(10);
    createStumps(-10);

    // 6. Trajectories Generator
    const trajectoriesGroup = new THREE.Group();
    scene.add(trajectoriesGroup);

    // Trajectory 1: In-swinging Yorker (Red/Orange)
    const curveYorker = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 3.2, -10),
      new THREE.Vector3(0.8, 2.6, -4),
      new THREE.Vector3(0.4, 1.5, 2),
      new THREE.Vector3(-0.1, 0.1, 7.8), // Yorker pitch on crease
      new THREE.Vector3(-0.2, 0.6, 9.9)  // Stumps crash
    ]);
    const geoYorker = new THREE.TubeGeometry(curveYorker, 64, 0.12, 8, false);
    const matYorker = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const meshYorker = new THREE.Mesh(geoYorker, matYorker);
    trajectoriesGroup.add(meshYorker);

    // Trajectory 2: Clutch Six over Long-On (RR Pink Neon Arc)
    const curveSix = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.8, 8.8),
      new THREE.Vector3(-3, 8.0, 0),
      new THREE.Vector3(-8, 15.0, -15),
      new THREE.Vector3(-14, 12.0, -32),
      new THREE.Vector3(-19, 0.5, -46) // Landing beyond ropes into stands
    ]);
    const geoSix = new THREE.TubeGeometry(curveSix, 80, 0.18, 8, false);
    const matSix = new THREE.MeshBasicMaterial({ color: 0xea1a88 });
    const meshSix = new THREE.Mesh(geoSix, matSix);
    trajectoriesGroup.add(meshSix);

    // Trajectory 3: Clutch Leg-Spin/Googly (Cyan/Gold)
    const curveSpin = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.3, 2.8, -9.5),
      new THREE.Vector3(-0.4, 2.3, -3),
      new THREE.Vector3(-0.2, 0.05, 4.5), // Pitch landing
      new THREE.Vector3(0.8, 0.9, 8.5),   // Sharp turn beating bat
      new THREE.Vector3(1.2, 1.1, 10.5)
    ]);
    const geoSpin = new THREE.TubeGeometry(curveSpin, 64, 0.12, 8, false);
    const matSpin = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const meshSpin = new THREE.Mesh(geoSpin, matSpin);
    trajectoriesGroup.add(meshSpin);

    // 7. Ball Particle Pulse Animation
    const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pulseBall = new THREE.Mesh(ballGeo, ballMat);
    scene.add(pulseBall);

    let tProgress = 0;
    let angle = 0;

    // Mouse interaction for rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !interactive) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      angle += deltaX * 0.005;
      camera.position.y = Math.max(8, Math.min(60, camera.position.y - deltaY * 0.1));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      // Trajectory pulse
      tProgress = (tProgress + 0.01) % 1;
      let activeCurve = curveSix;
      if (activeTraj === 'yorker') activeCurve = curveYorker;
      else if (activeTraj === 'spin') activeCurve = curveSpin;
      
      const pt = activeCurve.getPointAt(tProgress);
      pulseBall.position.copy(pt);

      // Camera auto-rotation or fixed perspective
      if (isRotating && !isDragging) {
        angle += 0.003;
      }

      if (cameraView === 'broadcast') {
        const radius = 65;
        camera.position.x = radius * Math.sin(angle);
        camera.position.z = radius * Math.cos(angle);
        camera.lookAt(0, 4, 0);
      } else if (cameraView === 'pitch') {
        camera.position.set(0, 4, 18);
        camera.lookAt(0, 1.5, -10);
      } else if (cameraView === 'tactical') {
        camera.position.set(0, 75, 0.1);
        camera.lookAt(0, 0, 0);
      }

      // Visibility toggles
      meshYorker.visible = activeTraj === 'all' || activeTraj === 'yorker';
      meshSix.visible = activeTraj === 'all' || activeTraj === 'six';
      meshSpin.visible = activeTraj === 'all' || activeTraj === 'spin';

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cameraView, isRotating, activeTraj, interactive]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl glass-panel shadow-2xl border border-pitch-border" style={{ height }}>
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Stadium HUD Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-none">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-rr-pink/40 text-xs font-mono text-slate-200">
          <span className="w-2 h-2 rounded-full bg-rr-pink animate-ping" />
          <span>3D TACTICAL STADIUM ARENA</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-400">
          60 FPS REALTIME
        </div>
      </div>

      {/* Controls HUD */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Camera Presets */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs">
            <button
              onClick={() => { setCameraView('broadcast'); setIsRotating(true); }}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                cameraView === 'broadcast' ? 'bg-rr-pink text-white font-medium shadow-lg shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Broadcast Orbit</span>
            </button>
            <button
              onClick={() => { setCameraView('pitch'); setIsRotating(false); }}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                cameraView === 'pitch' ? 'bg-rr-pink text-white font-medium shadow-lg shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Batter Crease</span>
            </button>
            <button
              onClick={() => { setCameraView('tactical'); setIsRotating(false); }}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                cameraView === 'tactical' ? 'bg-rr-pink text-white font-medium shadow-lg shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Top Tactical</span>
            </button>
          </div>

          {/* Delivery Scenario Highlights */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 px-2">High Leverage Trajectory:</span>
            <button
              onClick={() => setActiveTraj('all')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs ${activeTraj === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTraj('yorker')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs flex items-center space-x-1 ${
                activeTraj === 'yorker' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-orange-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span>Death Yorker</span>
            </button>
            <button
              onClick={() => setActiveTraj('six')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs flex items-center space-x-1 ${
                activeTraj === 'six' ? 'bg-rr-pink text-white font-bold' : 'text-slate-400 hover:text-rr-pink'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rr-pink" />
              <span>Chase 6 (108m)</span>
            </button>
            <button
              onClick={() => setActiveTraj('spin')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs flex items-center space-x-1 ${
                activeTraj === 'spin' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Googly Dot</span>
            </button>
          </div>

          {/* Rotation Toggle */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-rr-pink/50 transition-all"
            title={isRotating ? "Pause Orbit" : "Resume Orbit"}
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
