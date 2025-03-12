import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Scene } from "../Scene";
import * as THREE from "three";

describe("Scene", () => {
  let scene: Scene;

  beforeEach(() => {
    scene = new Scene();
  });

  afterEach(() => {
    scene.destory();
  });

  it("should initialize with default scene if no scene is provided", () => {
    const scene = new Scene();
    scene.initialize();
    expect(scene.getScene()).toBeDefined();
  });

  it("should initialize with given scene if provided", () => {
    const givenScene = new THREE.Scene();
    const scene = new Scene(givenScene);
    scene.initialize();
    expect(scene.getScene()).toBe(givenScene);
  });

  it("should initialize background, floor, gridHelper, and lights", () => {
    scene.initialize();
    expect(scene.getScene().background).toBeDefined();
    expect(scene.getScene().children.length).toBe(4);
    expect(scene.getScene().children[0]).toBeInstanceOf(THREE.Mesh);
    expect(scene.getScene().children[1]).toBeInstanceOf(THREE.GridHelper);
    expect(scene.getScene().children[2]).toBeInstanceOf(THREE.AmbientLight);
    expect(scene.getScene().children[3]).toBeInstanceOf(THREE.DirectionalLight);
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
    expect(scene.getFloor().material.color).toStrictEqual(color);
  });

  it("should set floor to texture if texture is provided", () => {
    const texture = scene.loadTexture("src/assets/floor-texture.svg");
    scene.setFloor(null, texture);
    expect(scene.getFloor().material.map).toBe(texture);
  });

  it("should add gridHelper", () => {
    scene.addGridHelper();
    expect(scene.getScene().children[0]).toBeInstanceOf(THREE.GridHelper);
  });

  it("should add lights", () => {
    scene.addLights();
    expect(scene.getScene().children[0]).toBeInstanceOf(THREE.AmbientLight);
    expect(scene.getScene().children[1]).toBeInstanceOf(THREE.DirectionalLight);
  });

  it("should destroy scene", () => {
    scene.destory();
    expect(scene.getScene().children.length).toBe(0);
  });
});
