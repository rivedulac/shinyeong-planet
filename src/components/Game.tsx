import React, { useEffect, useState } from "react";
import { Camera } from "./Camera";
import { PlayerController } from "./PlayerController";
import CameraPositionDisplay from "./CameraPositionDisplay";
import { Scene } from "./Scene";

const Game: React.FC = () => {
  const [cameraPosition, setCameraPosition] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  });

  useEffect(() => {
    // Set up scene
    const scene = new Scene();
    const camera = new Camera();

    // Initialize player controller with the camera
    const playerController = new PlayerController(
      camera.getPerspectiveCamera()
    );

    // Initial camera position
    setCameraPosition(camera.getPerspective());

    scene.setup();

    // Animation loop
    let animationId: number;

    const animate = () => {
      // Update player controller with deltaTime
      playerController.update();

      // Update camera position state on each frame
      setCameraPosition(camera.getPerspective());

      animationId = requestAnimationFrame(animate);
      scene.render(camera.getPerspectiveCamera());
    };

    animationId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      camera.handleResize(window.innerWidth, window.innerHeight);
      scene.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      // Clean up player controller
      playerController.dispose();

      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      // Dispose resources
      scene.destory();
    };
  }, []);

  return (
    <>
      <div id="game-container" style={{ width: "100%", height: "100vh" }} />
      <CameraPositionDisplay perspective={cameraPosition} />
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
          zIndex: 1000,
        }}
      >
        Controls:
        <div>W - Move Forward</div>
        <div>S - Move Backward</div>
        <div>A - Rotate Left</div>
        <div>D - Rotate Right</div>
      </div>
    </>
  );
};

export default Game;
