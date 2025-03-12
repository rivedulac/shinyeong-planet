import * as THREE from "three";

const backgroundTexturePath = "src/assets/background-texture.svg";
const floorTexturePath = "src/assets/floor-texture.svg";

export class Scene {
  private scene: THREE.Scene;

  private textureLoader: THREE.TextureLoader;

  private floor: THREE.Mesh;

  constructor(scene: THREE.Scene | null = null) {
    this.scene = scene || new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();
  }

  public initialize() {
    this.setBackground(null, this.loadTexture(backgroundTexturePath));
    this.setFloor(null, this.loadTexture(floorTexturePath));
    this.addGridHelper();
    this.addLights();
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

  public setBackground(
    color: THREE.Color | null,
    texture: THREE.Texture | null
  ) {
    if (color) {
      this.scene.background = color;
    } else if (texture) {
      this.scene.background = texture;
    }
  }

  public setFloor(color: THREE.Color | null, texture: THREE.Texture | null) {
    // TODO: prevent adding multiple floors
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    let floorMaterial: THREE.Material;
    if (color) {
      floorMaterial = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
      });
    } else if (texture) {
      floorMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    } else {
      throw new Error("No floor material provided");
    }

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2; // Rotate to be horizontal
    floor.position.y = -2; // Position floor below the origin
    this.floor = floor;
    this.scene.add(floor);
  }

  public addGridHelper() {
    const gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(gridHelper);
  }

  public addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }

  public destory() {
    this.scene.clear();
  }

  public getScene() {
    return this.scene;
  }

  public getFloor() {
    return this.floor;
  }
}
