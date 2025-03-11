import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Camera } from "./Camera";
import CameraPositionDisplay from "./CameraPositionDisplay";

// We'll use string paths instead of imports
const backgroundTexturePath = "src/assets/background-texture.svg";
const floorTexturePath = "src/assets/floor-texture.svg";

const GameScene: React.FC = () => {
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const container = document.getElementById("game-container");
    if (!container) return;

    // Set up scene
    const scene = new THREE.Scene();
    const camera = new Camera();

    // Initial camera position
    setCameraPosition(camera.getPosition());

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Load textures
    const textureLoader = new THREE.TextureLoader();

    // Background texture
    const backgroundTexture = textureLoader.load(
      backgroundTexturePath,
      (texture) => {
        console.log("Background texture loaded successfully:", texture);
      },
      (progress) => {
        console.log(
          "Background texture loading progress:",
          (progress.loaded / progress.total) * 100,
          "%"
        );
      },
      (error) => {
        console.error("Error loading background texture:", error);
        console.error("Attempted to load from path:", backgroundTexturePath);
      }
    );

    scene.background = backgroundTexture;

    // Floor texture
    const floorTexture = textureLoader.load(
      floorTexturePath,
      (texture) => {
        console.log("Floor texture loaded successfully:", texture);
      },
      (progress) => {
        console.log(
          "Floor texture loading progress:",
          (progress.loaded / progress.total) * 100,
          "%"
        );
      },
      (error) => {
        console.error("Error loading floor texture:", error);
        console.error("Attempted to load from path:", floorTexturePath);
      }
    );

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2; // Rotate to be horizontal
    floor.position.y = -2; // Position floor below the origin
    scene.add(floor);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Animation loop
    let animationId: number;

    const animate = () => {
      // Update camera position state on each frame
      setCameraPosition(camera.getPosition());

      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera.getPerspectiveCamera());
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.handleResize(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      floorGeometry.dispose();
      floorMaterial.dispose();
      floorTexture.dispose();
      if (backgroundTexture) backgroundTexture.dispose();
    };
  }, []);

  return (
    <>
      <div id="game-container" style={{ width: "100%", height: "100vh" }} />
      <CameraPositionDisplay position={cameraPosition} />
    </>
  );
};

export default GameScene;
