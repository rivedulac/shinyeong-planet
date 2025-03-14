import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Scene } from "../../core/Scene";
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

  it("should initialize background, planet, gridHelper, and lights", () => {
    const addSpy = vi.spyOn(scene.getScene(), "add");

    scene.setup();

    // Check that add was called appropriate number of times
    // Planet, grid helper, ambient light, directional light, starfield
    expect(addSpy).toHaveBeenCalledTimes(5);
  });

  it("should load texture", () => {
    const texture = scene.loadTexture("src/assets/background-texture.svg");
    expect(texture).toBeDefined();
    expect(texture).toBeInstanceOf(THREE.Texture);
  });

  it("should set background to color if color is provided", () => {
    const color = new THREE.Color(0x000000);
    scene.setBackground(color, undefined);
    expect(scene.getScene().background).toBe(color);
  });

  it("should set background to texture if texture is provided", () => {
    const texture = scene.loadTexture("src/assets/background-texture.svg");
    scene.setBackground(undefined, texture);
    expect(scene.getScene().background).toBe(texture);
  });

  it("should set planet to color if color is provided", () => {
    const color = new THREE.Color(0x000000);
    scene.setPlanet(color);
    // @ts-ignore: Material is a single object
    expect(scene.getPlanet()?.material.color).toStrictEqual(color);
  });

  it("should set planet to texture if texture is provided", () => {
    const texture = scene.loadTexture("src/assets/planet-texture.svg");
    scene.setPlanet(undefined, texture);
    // @ts-ignore: Material is a single object
    expect(scene.getPlanet()?.material.map).toBe(texture);
  });

  it("should not add gridHelper if planet is not set", () => {
    const spy = vi.spyOn(scene.getScene(), "add");
    scene.addGridHelper();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should add gridHelper if planet is set", () => {
    const spy = vi.spyOn(scene.getScene(), "add");
    scene.setPlanet(new THREE.Color("#000000"));
    scene.addGridHelper();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(scene.getScene().children[1]).toBeInstanceOf(THREE.Group);
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
