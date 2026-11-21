import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    let width = currentMount.clientWidth || window.innerWidth;
    let height = currentMount.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group for all rotating objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Nucleus (Golden glowing icosahedron wireframe + solid core)
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      shininess: 90,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    const wireIcoGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const wireIcoMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const wireIcoMesh = new THREE.Mesh(wireIcoGeo, wireIcoMat);
    mainGroup.add(wireIcoMesh);

    // 2. Three Intersecting Electron Rings (Atomic Model)
    const ringRadius = 5.2;
    const ringTube = 0.04;
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      roughness: 0.2,
      metalness: 0.8
    });
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      roughness: 0.2,
      metalness: 0.8
    });
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      roughness: 0.2,
      metalness: 0.8
    });

    const ringGeo = new THREE.TorusGeometry(ringRadius, ringTube, 16, 100);
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.z = Math.PI / 6;
    mainGroup.add(ring2);

    const ring3 = new THREE.Mesh(ringGeo, ringMat3);
    ring3.rotation.x = -Math.PI / 3;
    ring3.rotation.z = Math.PI / 4;
    mainGroup.add(ring3);

    // 3. Orbiting Electron Spheres
    const electronGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const electronMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const electron1 = new THREE.Mesh(electronGeo, electronMat1);
    scene.add(electron1);

    const electronMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const electron2 = new THREE.Mesh(electronGeo, electronMat2);
    scene.add(electron2);

    const electronMat3 = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const electron3 = new THREE.Mesh(electronGeo, electronMat3);
    scene.add(electron3);

    // 4. Floating Geometric Satellites (Octahedrons & Tetrahedrons representing Science & Math)
    const floaters = [];
    const geomList = [
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9),
      new THREE.DodecahedronGeometry(0.7),
      new THREE.OctahedronGeometry(0.6)
    ];

    const positions = [
      [-7.5, 4.2, -2],
      [8.0, 3.8, -1],
      [-6.5, -4.5, 1],
      [7.2, -4.2, 0]
    ];

    positions.forEach((pos, idx) => {
      const mat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x60a5fa : 0xfbbf24,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: idx === 1 || idx === 2
      });
      const mesh = new THREE.Mesh(geomList[idx % geomList.length], mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      scene.add(mesh);
      floaters.push({
        mesh,
        baseY: pos[1],
        speed: 0.015 + idx * 0.005,
        rotSpeedX: 0.01 + idx * 0.008,
        rotSpeedY: 0.015 + idx * 0.006
      });
    });

    // 5. Ambient Star Field / Dust Particles
    const starCount = 650;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const chosen = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = chosen.r;
      starColors[i * 3 + 1] = chosen.g;
      starColors[i * 3 + 2] = chosen.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 2.5);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.0);
    dirLight2.position.set(-12, -10, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x60a5fa, 3, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = currentMount.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / width - 0.5) * 2;
      mouseY = (y / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize
    const handleResize = () => {
      if (!currentMount) return;
      width = currentMount.clientWidth;
      height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let reqId;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mainGroup.rotation.y = elapsedTime * 0.35 + targetX * 0.8;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2 + targetY * 0.5;

      wireIcoMesh.rotation.x = elapsedTime * 0.5;
      wireIcoMesh.rotation.z = elapsedTime * 0.3;

      // Orbit electrons along angles
      const t1 = elapsedTime * 1.8;
      electron1.position.x = mainGroup.position.x + Math.cos(t1) * ringRadius * 0.85;
      electron1.position.y = mainGroup.position.y + Math.sin(t1) * ringRadius * 0.85 * Math.sin(Math.PI / 3);
      electron1.position.z = mainGroup.position.z + Math.sin(t1) * ringRadius * 0.85 * Math.cos(Math.PI / 3);

      const t2 = elapsedTime * 1.5 + 2.0;
      electron2.position.x = mainGroup.position.x + Math.sin(t2) * ringRadius * 0.85 * Math.cos(Math.PI / 3);
      electron2.position.y = mainGroup.position.y + Math.cos(t2) * ringRadius * 0.85;
      electron2.position.z = mainGroup.position.z + Math.sin(t2) * ringRadius * 0.85 * Math.sin(Math.PI / 6);

      const t3 = elapsedTime * 2.1 + 4.0;
      electron3.position.x = mainGroup.position.x + Math.cos(t3) * ringRadius * 0.85 * Math.cos(Math.PI / 4);
      electron3.position.y = mainGroup.position.y + Math.sin(t3) * ringRadius * 0.85;
      electron3.position.z = mainGroup.position.z + Math.cos(t3) * ringRadius * 0.85 * Math.sin(Math.PI / 4);

      // Animate floating geometric satellites
      floaters.forEach((f, idx) => {
        f.mesh.rotation.x += f.rotSpeedX;
        f.mesh.rotation.y += f.rotSpeedY;
        f.mesh.position.y = f.baseY + Math.sin(elapsedTime * 1.5 + idx) * 0.45;
      });

      // Slowly rotate particle field
      starField.rotation.y = elapsedTime * 0.04;
      starField.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
      style={{ opacity: 0.95 }}
    />
  );
}
