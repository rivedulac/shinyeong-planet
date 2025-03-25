import * as THREE from "three";
import {
  PLANET_CENTER,
  PLANET_RADIUS,
  TIME_BASED_BACKGROUND_GRADIENTS,
  getDaytimePeriod,
} from "../config/constants";
import { textures } from "../../public/assets";

export class Scene {
  private container: HTMLDivElement;

  private scene: THREE.Scene;

  private renderer: THREE.WebGLRenderer;

  private textureLoader: THREE.TextureLoader;

  private planet: THREE.Mesh | null = null;

  private backgroundMesh: THREE.Mesh | null = null;

  constructor(
    documentDI?: HTMLDivElement,
    renderer?: THREE.WebGLRenderer,
    scene?: THREE.Scene
  ) {
    this.container =
      documentDI ||
      (document.getElementById("game-container") as HTMLDivElement);
    if (!this.container) {
      throw new Error("Game container not found");
    }
    this.renderer = renderer || new THREE.WebGLRenderer({ antialias: true });
    this.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    this.scene = scene || new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();
  }

  private createGradientTexture(
    top: THREE.Color,
    middle: THREE.Color,
    bottom: THREE.Color
  ): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // Create gradient
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, `#${top.getHexString()}`);
    gradient.addColorStop(0.5, `#${middle.getHexString()}`);
    gradient.addColorStop(1, `#${bottom.getHexString()}`);

    // Fill gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1, 256);

    // Create texture from canvas
    const gradientTexture = new THREE.CanvasTexture(canvas);
    gradientTexture.magFilter = THREE.LinearFilter;
    gradientTexture.minFilter = THREE.LinearFilter;

    return gradientTexture;
  }

  private createBackgroundMesh(texture: THREE.Texture): THREE.Mesh {
    // Create a large sphere to act as background
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
    });

    return new THREE.Mesh(geometry, material);
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  public render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera);
  }

  public setup() {
    // Determine current time period and set background
    const timePeriod = getDaytimePeriod();
    const gradientColors =
      TIME_BASED_BACKGROUND_GRADIENTS[
        timePeriod as keyof typeof TIME_BASED_BACKGROUND_GRADIENTS
      ];

    // Create gradient texture
    const gradientTexture = this.createGradientTexture(
      gradientColors.top,
      gradientColors.middle,
      gradientColors.bottom
    );

    // Create and add background mesh
    this.backgroundMesh = this.createBackgroundMesh(gradientTexture);
    this.scene.add(this.backgroundMesh);

    this.setPlanet(undefined, this.loadTexture(textures.planetTexture));
    this.addGridHelper();
    this.addLights();

    const starfield = this.createStarfield();
    this.scene.add(starfield);
  }

  public loadTexture(path: string) {
    return this.textureLoader.load(
      path,
      (texture) => {
        console.log("Texture loaded successfully", texture);
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
        console.error("Attempted to load from path:", path);
      }
    );
  }

  public setBackground(color?: THREE.Color, texture?: THREE.Texture) {
    if (color) {
      this.scene.background = color;
    } else if (texture) {
      this.scene.background = texture;
    }
  }

  public setPlanet(color?: THREE.Color, texture?: THREE.Texture) {
    // Remove existing planet if present to prevent multiple planets
    if (this.planet) {
      this.scene.remove(this.planet);
    }

    // Create a sphere for the planet instead of a plane
    const planetGeometry = new THREE.SphereGeometry(PLANET_RADIUS, 32, 32);

    let planetMaterial: THREE.Material;
    if (color) {
      planetMaterial = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.FrontSide,
      });
    } else if (texture) {
      planetMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.FrontSide,
      });
    } else {
      throw new Error("No planet material provided");
    }

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.copy(PLANET_CENTER);
    this.planet = planet;
    this.scene.add(planet);
  }

  /**
   * Smoothly transition background gradient
   * @param top Top color of the gradient
   * @param middle Middle color of the gradient
   * @param bottom Bottom color of the gradient
   * @param duration Transition duration in milliseconds
   */
  public transitionBackground(
    top: THREE.Color,
    middle: THREE.Color,
    bottom: THREE.Color,
    duration: number = 2000
  ) {
    if (!this.backgroundMesh) return;

    // Create new gradient texture
    const targetTexture = this.createGradientTexture(top, middle, bottom);
    const originalTexture = (
      this.backgroundMesh.material as THREE.MeshBasicMaterial
    ).map;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth transition
      const material = this.backgroundMesh!.material as THREE.MeshBasicMaterial;
      material.opacity = 1;
      material.transparent = true;
      material.map = this.blendTextures(
        originalTexture!,
        targetTexture,
        progress
      );
      material.needsUpdate = true;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private blendTextures(
    texture1: THREE.Texture,
    texture2: THREE.Texture,
    progress: number
  ): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // Create temporary canvases for source textures
    const canvas1 = texture1.image;
    const canvas2 = texture2.image;

    // Draw blended image
    context.globalAlpha = 1 - progress;
    context.drawImage(canvas1, 0, 0, 1, 256, 0, 0, 1, 256);
    context.globalAlpha = progress;
    context.drawImage(canvas2, 0, 0, 1, 256, 0, 0, 1, 256);

    // Create and return new blended texture
    const blendedTexture = new THREE.CanvasTexture(canvas);
    blendedTexture.magFilter = THREE.LinearFilter;
    blendedTexture.minFilter = THREE.LinearFilter;

    return blendedTexture;
  }

  /**
   * Check and update background based on current time
   */
  public updateBackgroundForTime() {
    const timePeriod = getDaytimePeriod();
    const gradientColors =
      TIME_BASED_BACKGROUND_GRADIENTS[
        timePeriod as keyof typeof TIME_BASED_BACKGROUND_GRADIENTS
      ];

    this.transitionBackground(
      gradientColors.top,
      gradientColors.middle,
      gradientColors.bottom
    );
  }

  public addGridHelper() {
    // Instead of a grid helper, let's add latitude/longitude lines for the planet
    if (!this.planet) return; // Make sure planet exists

    // Create a group to hold all the grid lines
    const gridGroup = new THREE.Group();
    this.scene.add(gridGroup);

    // Create longitude lines (vertical circles)
    const longitudeCount = 24; // 24 segments
    for (let i = 0; i < longitudeCount; i++) {
      const angle = (i / longitudeCount) * Math.PI * 2;
      const geometry = new THREE.TorusGeometry(
        PLANET_RADIUS,
        0.1,
        16,
        100,
        Math.PI * 2
      );

      // Use black color for prime meridian (0°), white for others
      const material = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x000000 : 0xffffff,
        transparent: true,
        opacity: i === 0 ? 1.0 : 0.3, // More visible for prime meridian
      });

      const torus = new THREE.Mesh(geometry, material);

      // Rotate to create longitude lines
      torus.rotation.y = angle;

      // Position to match the planet
      torus.position.copy(PLANET_CENTER);

      gridGroup.add(torus);
    }

    // Create latitude lines (horizontal circles)
    const latitudeCount = 12; // 12 horizontal lines
    for (let i = 0; i < latitudeCount; i++) {
      // Changed to start from 0 to include equator
      const radius = Math.sin((i / latitudeCount) * Math.PI) * PLANET_RADIUS;
      const height = Math.cos((i / latitudeCount) * Math.PI) * PLANET_RADIUS;

      const geometry = new THREE.TorusGeometry(
        radius,
        0.1,
        16,
        100,
        Math.PI * 2
      );

      // Use black color for equator (when i = latitudeCount/2), white for others
      const isEquator = i === Math.floor(latitudeCount / 2);
      const material = new THREE.MeshBasicMaterial({
        color: isEquator ? 0x000000 : 0xffffff,
        transparent: true,
        opacity: isEquator ? 0.8 : 0.3, // More visible for equator
      });

      const torus = new THREE.Mesh(geometry, material);

      // Rotate to make horizontal
      torus.rotation.x = Math.PI / 2;

      // Position to match the planet surface
      torus.position.copy(this.planet.position);
      torus.position.y += height;

      gridGroup.add(torus);
    }
  }

  public addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }

  public createStarfield(): THREE.Points {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const outerRadius = 500; // Outer boundary of star field
    const innerRadius = PLANET_RADIUS * 2; // Minimum distance from planet

    let validStarsAdded = 0;
    let attempts = 0;
    const maxAttempts = starCount * 10; // Prevent infinite loop

    while (validStarsAdded < starCount && attempts < maxAttempts) {
      // Random position within a sphere
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(1 - 2 * Math.random());
      const r = outerRadius * Math.cbrt(Math.random());

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      // Check distance from planet center
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);

      if (distanceFromCenter > innerRadius) {
        positions[validStarsAdded * 3] = x;
        positions[validStarsAdded * 3 + 1] = y;
        positions[validStarsAdded * 3 + 2] = z;

        // Star colors
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.5, 0.7 + Math.random() * 0.3);

        colors[validStarsAdded * 3] = color.r;
        colors[validStarsAdded * 3 + 1] = color.g;
        colors[validStarsAdded * 3 + 2] = color.b;

        validStarsAdded++;
      }

      attempts++;
    }

    // Trim the arrays if we couldn't generate enough stars
    const trimmedPositions = positions.slice(0, validStarsAdded * 3);
    const trimmedColors = colors.slice(0, validStarsAdded * 3);

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(trimmedPositions, 3)
    );
    starsGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(trimmedColors, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    starfield.name = "starfield";

    return starfield;
  }

  public destroy() {
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.scene.clear();
  }

  public getScene() {
    return this.scene;
  }

  public getPlanet() {
    return this.planet;
  }

  public getWidth() {
    return this.renderer.domElement.width;
  }

  public getHeight() {
    return this.renderer.domElement.height;
  }
}
