import * as THREE from "three";
import { PLANET_CENTER, PLANET_RADIUS } from "../config/constants";
const backgroundTexturePath = "src/assets/background-texture.svg";
const planetTexturePath = "src/assets/planet-texture.svg";

export class Scene {
  private container: HTMLDivElement;

  private scene: THREE.Scene;

  private renderer: THREE.WebGLRenderer;

  private textureLoader: THREE.TextureLoader;

  private planet: THREE.Mesh | null = null;

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

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  public render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera);
  }

  public setup() {
    this.setBackground(new THREE.Color(0x00001a));
    this.setPlanet(undefined, this.loadTexture(planetTexturePath));
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
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
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
    for (let i = 1; i < latitudeCount; i++) {
      const radius = Math.sin((i / latitudeCount) * Math.PI) * PLANET_RADIUS;
      const height = Math.cos((i / latitudeCount) * Math.PI) * PLANET_RADIUS;

      const geometry = new THREE.TorusGeometry(
        radius,
        0.1,
        16,
        100,
        Math.PI * 2
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
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
    const starCount = 5000; // Adjust number of stars as needed

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const radius = 500; // Large radius to encompass the entire scene

    for (let i = 0; i < starCount; i++) {
      // Random position within a sphere
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(1 - 2 * Math.random());
      const r = radius * Math.cbrt(Math.random());

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Star colors: mostly white with some variation
      const color = new THREE.Color();
      color.setHSL(
        Math.random(), // Random hue
        0.5, // Moderate saturation
        0.7 + Math.random() * 0.3 // Varied lightness
      );

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.5, // Size of stars
      vertexColors: true, // Use the color attribute
      blending: THREE.AdditiveBlending, // Make stars glow
      transparent: true,
      depthWrite: false,
    });

    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    starfield.name = "starfield"; // For easy identification

    return starfield;
  }

  public destory() {
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
