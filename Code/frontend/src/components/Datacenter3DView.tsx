import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rack, RackUnit } from '../types';

interface Datacenter3DViewProps {
  racks: Rack[];
  selectedRackId: string;
  selectedUnit: RackUnit;
  onSelectRack: (rackId: string) => void;
  onSelectUnit: (unit: RackUnit, rack: Rack) => void;
  viewMode: 'normal' | 'thermal' | 'workload';
}

export const Datacenter3DView: React.FC<Datacenter3DViewProps> = ({
  racks,
  selectedRackId,
  selectedUnit,
  onSelectRack,
  onSelectUnit,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 11);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Blue/Cyan Rim Accent Light
    const cyanLight = new THREE.PointLight(0x0284c7, 3, 18);
    cyanLight.position.set(-4, 3, 2);
    scene.add(cyanLight);

    // Amber/Red Alert Accent Light
    const alertLight = new THREE.PointLight(0xf43f5e, 3.5, 12);
    alertLight.position.set(0, 3.5, 0);
    scene.add(alertLight);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(24, 24, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Floor Plate with reflection
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.2,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Interactive Rack Meshes Map
    const rackMeshes: { mesh: THREE.Group; rackId: string; rackData: Rack }[] = [];
    const unitMeshes: { mesh: THREE.Mesh; unitData: RackUnit; rackData: Rack }[] = [];

    // Rack Positions (3 bays: Left A1, Center A2, Right B1)
    const rackPositions = [
      { id: 'rack-a1', x: -3.5, z: 0 },
      { id: 'rack-a2', x: 0, z: 0 },
      { id: 'rack-b1', x: 3.5, z: 0 },
    ];

    racks.slice(0, 3).forEach((rack, index) => {
      const pos = rackPositions[index] || { id: rack.id, x: (index - 1) * 3.5, z: 0 };
      const rackGroup = new THREE.Group();
      rackGroup.position.set(pos.x, 0, pos.z);

      const isSelectedRack = rack.id === selectedRackId;

      // Outer Rack Frame (Chassis)
      const frameWidth = 1.8;
      const frameHeight = 4.2;
      const frameDepth = 1.4;

      const frameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
      const frameMat = new THREE.MeshStandardMaterial({
        color: isSelectedRack ? 0x0f172a : 0x090d16,
        roughness: 0.3,
        metalness: 0.9,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = frameHeight / 2;
      frame.castShadow = true;
      frame.receiveShadow = true;
      rackGroup.add(frame);

      // Glass Front Door Panel
      const doorGeo = new THREE.PlaneGeometry(frameWidth - 0.1, frameHeight - 0.2);
      const doorMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.8,
        ior: 1.5
      });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, frameHeight / 2, frameDepth / 2 + 0.01);
      rackGroup.add(door);

      // Top Rack Name Tag Panel
      const tagGeo = new THREE.BoxGeometry(frameWidth - 0.2, 0.3, 0.1);
      const tagMat = new THREE.MeshStandardMaterial({
        color: isSelectedRack ? 0x0284c7 : 0x1e293b,
        emissive: isSelectedRack ? 0x0284c7 : 0x000000,
        emissiveIntensity: isSelectedRack ? 0.6 : 0
      });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0, frameHeight - 0.25, frameDepth / 2 + 0.05);
      rackGroup.add(tag);

      // Server Blade Slots inside the rack
      const safeUnits = Array.isArray(rack.units) && rack.units.length > 0 ? rack.units : [
        { u: 1, name: `${rack.name} - Unit 01`, model: 'Standard Node Blade', status: 'healthy', temp: 38, cpu: 20, ram: 30, disk: 20, net: 10 },
        { u: 2, name: `${rack.name} - Unit 02`, model: 'Standard Node Blade', status: 'healthy', temp: 40, cpu: 25, ram: 35, disk: 22, net: 12 },
        { u: 3, name: `${rack.name} - Unit 03`, model: 'Compute Node Blade', status: rack.status === 'healthy' ? 'healthy' : 'warning', temp: rack.temperature || 42, cpu: 45, ram: 50, disk: 30, net: 15 }
      ];
      const slotHeight = 0.45;
      const startY = 0.5;

      safeUnits.forEach((unit, uIdx) => {
        const isCritical = unit.status === 'critical';
        const isSelectedUnit = selectedUnit?.name === unit.name;

        let bladeColor = 0x1e293b;
        let emissiveColor = 0x10b981;
        let emissiveIntensity = 0.5;

        if (viewMode === 'thermal') {
          if (unit.temp > 80) {
            bladeColor = 0x881337;
            emissiveColor = 0xf43f5e;
            emissiveIntensity = 1.2;
          } else if (unit.temp > 60) {
            bladeColor = 0x78350f;
            emissiveColor = 0xf59e0b;
            emissiveIntensity = 0.8;
          } else {
            bladeColor = 0x064e3b;
            emissiveColor = 0x10b981;
            emissiveIntensity = 0.6;
          }
        } else if (isCritical) {
          bladeColor = 0x4c0519;
          emissiveColor = 0xf43f5e;
          emissiveIntensity = 1.5;
        } else if (isSelectedUnit) {
          bladeColor = 0x0369a1;
          emissiveColor = 0x38bdf8;
          emissiveIntensity = 1.2;
        }

        const bladeGeo = new THREE.BoxGeometry(frameWidth - 0.2, slotHeight, frameDepth - 0.1);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: bladeColor,
          roughness: 0.4,
          metalness: 0.8,
          emissive: emissiveColor,
          emissiveIntensity: emissiveIntensity * 0.4
        });
        const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
        bladeMesh.position.set(0, startY + uIdx * (slotHeight + 0.15), 0.02);
        bladeMesh.castShadow = true;
        bladeMesh.userData = { unit, rack };

        // Front Status LED Dot
        const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xf43f5e : 0x10b981
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(frameWidth / 2 - 0.25, 0, (frameDepth - 0.1) / 2 + 0.02);
        bladeMesh.add(led);

        // Selection / Critical Beacon Ring over the unit
        if (isCritical) {
          const beaconGeo = new THREE.RingGeometry(0.08, 0.15, 16);
          const beaconMat = new THREE.MeshBasicMaterial({
            color: 0xf43f5e,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(0, 0, (frameDepth - 0.1) / 2 + 0.03);
          bladeMesh.add(beacon);
        }

        rackGroup.add(bladeMesh);
        unitMeshes.push({ mesh: bladeMesh, unitData: unit, rackData: rack });
      });

      scene.add(rackGroup);
      rackMeshes.push({ mesh: rackGroup, rackId: rack.id, rackData: rack });
    });

    // Raycasting for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(unitMeshes.map(u => u.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;
        if (data?.unit) {
          setHoveredInfo(`${data.rack.name}: ${data.unit.name} (${data.unit.temp}°C)`);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredInfo(null);
      container.style.cursor = 'grab';
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(unitMeshes.map(u => u.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;
        if (data?.unit && data?.rack) {
          onSelectRack(data.rack.id);
          onSelectUnit(data.unit, data.rack);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Mouse Orbit Controls (Smooth drag)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0.2;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.005;
      targetRotationX = Math.max(0.05, Math.min(0.6, targetRotationX + deltaY * 0.003));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera orbit
      camera.position.x = Math.sin(targetRotationY) * 11;
      camera.position.z = Math.cos(targetRotationY) * 11;
      camera.position.y = 5 + targetRotationX * 6;
      camera.lookAt(0, 1.6, 0);

      // Alert light pulse
      alertLight.intensity = 2.5 + Math.sin(elapsedTime * 4) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [racks, selectedRackId, selectedUnit, viewMode]);

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden bg-[#060913]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

      {/* Floating 3D Twin HUD Overlays */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse glow-azure" />
        <span className="text-slate-300 font-mono font-bold text-[11px]">3D Digital Twin Engine (WebGL)</span>
      </div>

      {/* Controls Hint */}
      <div className="absolute top-3 right-3 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono">
        Kéo chuột để xoay 360° | Nhấp chọn Node
      </div>

      {/* Live Hover Tooltip */}
      {hoveredInfo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-sky-950/90 text-sky-200 border border-sky-400/40 backdrop-blur-lg px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl animate-in fade-in">
          🔍 {hoveredInfo}
        </div>
      )}
    </div>
  );
};
