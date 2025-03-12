import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Scene } from "../Scene";
import * as THREE from "three";

// Mock Three.js
vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...(actual as any),
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement("canvas"),
    })),
  };
});

describe("Scene", () => {
  let scene: Scene;
  let testContainer: HTMLDivElement;
  let mockRenderer: {
    setSize: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
    domElement: HTMLCanvasElement;
  };

  beforeEach(() => {
    testContainer = document.createElement("div");
    document.body.appendChild(testContainer);

    mockRenderer = {
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement("canvas"),
    };

    scene = new Scene(
      testContainer,
      mockRenderer as unknown as THREE.WebGLRenderer
    );
  });

  afterEach(() => {
    scene.destory();
    document.body.removeChild(testContainer);
    vi.clearAllMocks();
  });

  it("should initialize with default scene if no scene is provided", () => {
    expect(scene.getScene()).toBeDefined();
  });

  it("should initialize background, floor, gridHelper, and lights", () => {
    const addSpy = vi.spyOn(scene.getScene(), "add");

    scene.setup();

    // Check that add was called appropriate number of times
    // Floor, grid helper, ambient light, directional light
    expect(addSpy).toHaveBeenCalledTimes(4);
  });

  it("should load texture", () => {
    const texture = scene.loadTexture("src/assets/background-texture.svg");
    expect(texture).toBeDefined();
    expect(texture).toBeInstanceOf(THREE.Texture);
  });

  it("should set background to color if color is provided", () => {
    const color = new THREE.Color(0x000000);
    scene.setBackground(color, null);
    expect(scene.getScene().background).toBe(color);
  });

  it("should set background to texture if texture is provided", () => {
    const texture = scene.loadTexture("src/assets/background-texture.svg");
    scene.setBackground(null, texture);
    expect(scene.getScene().background).toBe(texture);
  });

  it("should set floor to color if color is provided", () => {
    const color = new THREE.Color(0x000000);
    scene.setFloor(color, null);
    // @ts-ignore: Material is a single object
    expect(scene.getFloor()?.material.color).toStrictEqual(color);
  });

  it("should set floor to texture if texture is provided", () => {
    const texture = scene.loadTexture("src/assets/floor-texture.svg");
    scene.setFloor(null, texture);
    // @ts-ignore: Material is a single object
    expect(scene.getFloor()?.material.map).toBe(texture);
  });

  it("should add gridHelper", () => {
    const addSpy = vi.spyOn(scene.getScene(), "add");
    scene.addGridHelper();
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  it("should add lights", () => {
    const addSpy = vi.spyOn(scene.getScene(), "add");
    scene.addLights();
    // Ambient light and directional light
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
});
