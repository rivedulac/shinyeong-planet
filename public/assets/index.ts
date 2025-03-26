// Define paths to assets in the public folder
export const textures = {
  planetTexture: "/assets/planet-texture.svg",
  backgroundTexture: "/assets/background-texture.svg",
};

export const models = {
  alien: "/assets/Alien.glb",
  astronaut: "/assets/Astronaut.glb",
  cow: "/assets/Cow.glb",
  iss: "/assets/International Space Station.glb",
  earth: "/assets/Earth.glb",
};

// This is useful for debugging asset paths
export const logAssetPaths = () => {
  console.log("Asset paths:");
  console.log("Planet texture:", textures.planetTexture);
  console.log("Background texture:", textures.backgroundTexture);
  console.log("Alien model:", models.alien);
  console.log("Astronaut model:", models.astronaut);
  console.log("Cow model:", models.cow);
  console.log("ISS model:", models.iss);
  console.log("Earth model:", models.earth);
};
