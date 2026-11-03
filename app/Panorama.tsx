"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// 360° 둘러보기. 360도 사진을 커다란 공 안쪽에 붙이고, 카메라를 공 한가운데 둔다.
// 마우스(손가락)로 끌면 고개를 돌리듯 둘러보고, 휠로 가까이/멀리 본다.
export default function Panorama({ src }: { src: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1100);

    // 공의 안쪽 면에 사진이 보이도록 공을 뒤집는다
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const texture = new THREE.TextureLoader().load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    scene.add(new THREE.Mesh(geometry, material));

    // lon: 좌우로 돌린 각도, lat: 위아래로 든 각도 (도 단위)
    let lon = 0;
    let lat = 0;
    let dragging = false;
    const start = { x: 0, y: 0, lon: 0, lat: 0 };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      start.x = e.clientX;
      start.y = e.clientY;
      start.lon = lon;
      start.lat = lat;
      mount.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      lon = start.lon - (e.clientX - start.x) * 0.15;
      lat = start.lat + (e.clientY - start.y) * 0.15;
    };
    const onUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = Math.min(Math.max(camera.fov + e.deltaY * 0.05, 40), 90);
      camera.updateProjectionMatrix();
    };

    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("pointercancel", onUp);
    mount.addEventListener("wheel", onWheel, { passive: false });

    let frame = 0;
    const render = () => {
      // 가만히 있을 때는 아주 천천히 혼자 돈다
      if (!dragging) lon += 0.03;
      lat = Math.min(Math.max(lat, -85), 85);
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      );
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("pointercancel", onUp);
      mount.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [src]);

  return <div ref={mountRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />;
}
