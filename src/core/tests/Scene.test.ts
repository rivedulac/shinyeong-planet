import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Scene } from "../Scene";
import * as THREE from "three";

const createMockMesh = () => ({
  position: {
    copy: vi.fn(),
    set: vi.fn(),
    x: 0,
    y: 0,
    z: 0,
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
    set: vi.fn(),
  },
  material: {
    color: null,
    map: null,
  },
  setRotationFromMatrix: vi.fn(),
});

vi.mock("three", async () => {
  const actual = await vi.importActual("three");

  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement("canvas"),
    })),

    // @ts-ignore: actual.Texture type error
    CanvasTexture: vi.fn().mockImplementation(() => new actual.Texture()),

    SphereGeometry: vi.fn(),
    TorusGeometry: vi.fn(),

    MeshBasicMaterial: vi.fn().mockImplementation(() => ({})),
    MeshStandardMaterial: vi.fn().mockImplementation((params) => params),

    Mesh: vi.fn().mockImplementation(() => createMockMesh()),

    // Mock other THREE objects needed for grid helper
    Group: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      position: { copy: vi.fn() },
    })),

    // For starfield creation
    BufferGeometry: vi.fn().mockImplementation(() => ({
      setAttribute: vi.fn(),
    })),
    BufferAttribute: vi.fn(),
    PointsMaterial: vi.fn(),
    Points: vi.fn().mockImplementation(() => ({
      name: "",
    })),
  };
});

// Mock the canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return {
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    globalAlpha: 1,
  };
}) as any;

describe("Scene", () => {
  let scene: Scene;
  let testContainer: HTMLDivElement;
  let mockRenderer: {
    setSize: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
    domElement: HTMLCanvasElement;
  };

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    testContainer = document.createElement("div");
    testContainer.id = "game-container";
    document.body.appendChild(testContainer);

    mockRenderer = {
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement("canvas"),
    };

    // Add the renderer's domElement to the container immediately
    testContainer.appendChild(mockRenderer.domElement);

    scene = new Scene(
      testContainer,
      mockRenderer as unknown as THREE.WebGLRenderer
    );

    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock the transitionBackground method
    scene.transitionBackground = vi.fn();
  });

  afterEach(() => {
    // In case the scene wasn't destroyed in the test
    try {
      scene.destroy();
    } catch (e) {
      // Ignore errors during cleanup
    }

    // Clean up DOM
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("should initialize with default scene if no scene is provided", () => {
    expect(scene.getScene()).toBeDefined();
    expect(scene.getScene()).toBeInstanceOf(THREE.Scene);
  });

  it("should initialize background, planet, gridHelper, and lights", () => {
    // Mock methods that depend on THREE.js operations
    vi.spyOn(scene as any, "createGradientTexture").mockReturnValue(
      new THREE.Texture()
    );
    vi.spyOn(scene as any, "createBackgroundMesh").mockReturnValue(
      createMockMesh()
    );
    vi.spyOn(scene, "setPlanet").mockImplementation(() => {});
    vi.spyOn(scene, "addGridHelper").mockImplementation(() => {});
    vi.spyOn(scene, "addLights").mockImplementation(() => {});
    vi.spyOn(scene, "createStarfield").mockReturnValue(new THREE.Points());
    vi.spyOn(scene, "addConstellations").mockImplementation(() => {});

    const addSpy = vi.spyOn(scene.getScene(), "add");

    scene.setup();

    expect(addSpy).toHaveBeenCalled();
  });

  it("should load texture", () => {
    const texture = scene.loadTexture("test-texture-path.svg");
    expect(texture).toBeDefined();
    expect(texture).toBeInstanceOf(THREE.Texture);
  });

  it("should set background to color if color is provided", () => {
    const color = new THREE.Color(0x000000);
    scene.setBackground(color, undefined);
    expect(scene.getScene().background).toBe(color);
  });

  it("should set background to texture if texture is provided", () => {
    const texture = new THREE.Texture();
    scene.setBackground(undefined, texture);
    expect(scene.getScene().background).toBe(texture);
  });

  it("should set planet to color if color is provided", () => {
    const color = new THREE.Color(0x000000);

    // We need to ensure our mock mesh has the proper structure
    const mockMesh = createMockMesh();
    vi.spyOn(THREE, "Mesh").mockImplementationOnce(
      () => mockMesh as unknown as THREE.Mesh
    );

    scene.setPlanet(color);

    expect(scene.getPlanet()).toBeDefined();
  });

  it("should throw error if no planet material is provided", () => {
    expect(() => {
      scene.setPlanet();
    }).toThrow("No planet material provided");
  });

  it("should not add gridHelper if planet is not set", () => {
    const spy = vi.spyOn(scene.getScene(), "add");
    scene.addGridHelper();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should add gridHelper if planet is set", () => {
    // First mock THREE.Mesh to return proper objects
    const mockMesh = createMockMesh();
    vi.spyOn(THREE, "Mesh")
      .mockImplementationOnce(() => mockMesh as unknown as THREE.Mesh) // For planet
      .mockImplementation(() => createMockMesh() as unknown as THREE.Mesh); // For torus meshes

    // Create planet first
    scene.setPlanet(new THREE.Color(0x000000));

    // Record spy after planet is created
    const addSpy = vi.spyOn(scene.getScene(), "add");

    // Now test adding grid helper
    scene.addGridHelper();

    // Verify that add was called at least once (for the grid group)
    expect(addSpy).toHaveBeenCalled();
  });

  it("should add lights", () => {
    const addSpy = vi.spyOn(scene.getScene(), "add");
    scene.addLights();
    expect(addSpy).toHaveBeenCalledTimes(2);
  });

  it("should call renderer.setSize when setSize is called", () => {
    scene.setSize(800, 600);
    expect(mockRenderer.setSize).toHaveBeenCalledWith(800, 600);
  });

  it("should call renderer.render when render is called", () => {
    const mockCamera = new THREE.PerspectiveCamera();
    scene.render(mockCamera);
    expect(mockRenderer.render).toHaveBeenCalledWith(
      scene.getScene(),
      mockCamera
    );
  });

  it("should create a starfield", () => {
    const starfield = scene.createStarfield();
    expect(starfield).toBeDefined();
  });

  it("should clean up on destroy", () => {
    const sceneObject = scene.getScene();
    const clearSpy = vi.spyOn(sceneObject, "clear");

    // Since we already attached the domElement in beforeEach,
    // this should work without errors
    scene.destroy();

    expect(clearSpy).toHaveBeenCalled();
  });

  it("should return width and height", () => {
    mockRenderer.domElement.width = 800;
    mockRenderer.domElement.height = 600;

    expect(scene.getWidth()).toBe(800);
    expect(scene.getHeight()).toBe(600);
  });

  describe("updateBackgroundForTime", () => {
    it("should use different random colors from the gradient arrays", () => {
      // Mock Math.random to return different values
      const mockRandom = vi.spyOn(Math, "random");
      mockRandom
        .mockReturnValueOnce(0) // First call returns first color
        .mockReturnValueOnce(0.5) // Second call returns middle color
        .mockReturnValueOnce(0.9); // Third call returns last color

      vi.mock("src/config/constants", () => ({
        getDaytimePeriod: vi.fn().mockReturnValue("morning"),
      }));

      scene.updateBackgroundForTime();

      // Verify that Math.random was called for each gradient
      expect(mockRandom).toHaveBeenCalledTimes(3);

      // Clean up
      mockRandom.mockRestore();
    });
  });
});
