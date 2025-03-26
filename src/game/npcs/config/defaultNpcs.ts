import * as THREE from "three";
import { StaticModel } from "../StaticModel";
import { AnimatedModel } from "../AnimatedModel";
import { createBillboardMesh } from "../Billboard";
import { createFlagMesh } from "../Flag";
import { models } from "../../../../public/assets";
import { WELCOME_CONVERSTAION } from "@/config/constants";

export interface NpcInitializer {
  create: (scene: THREE.Scene) => StaticModel;
}

export const defaultNpcs: NpcInitializer[] = [
  {
    create: () => {
      const billboardMesh = createBillboardMesh("Welcome");
      const welcomeBillboard = new StaticModel(
        "welcome-billboard",
        "Welcome",
        true,
        7,
        2,
        billboardMesh
      );
      welcomeBillboard.setConversation(WELCOME_CONVERSTAION);
      welcomeBillboard.setPositionOnPlanet(37.2, 0);
      return welcomeBillboard;
    },
  },
  {
    create: () => {
      const exchangeFlagMesh = createFlagMesh("🇫🇷", "Exchange in Paris");
      const exchangeFlag = new StaticModel(
        "exchange-france",
        "Exchange in Paris",
        true,
        0,
        1,
        exchangeFlagMesh
      );
      exchangeFlag.setPositionOnPlanet(48.86, 2.34);
      return exchangeFlag;
    },
  },
  {
    create: () => {
      const internshipFlagMesh = createFlagMesh("🇺🇸", "2020 Internship");
      const internshipFlag = new StaticModel(
        "internship-usa",
        "2020 Internship",
        true,
        0,
        2,
        internshipFlagMesh
      );
      internshipFlag.setPositionOnPlanet(37.77, -122.43);
      return internshipFlag;
    },
  },
  {
    create: () => {
      const experienceFlagMesh = createFlagMesh("🇰🇷", "2021~ SWE");
      const experienceFlag = new StaticModel(
        "experience-korea",
        "2021~ SWE",
        true,
        0,
        2,
        experienceFlagMesh
      );
      experienceFlag.setPositionOnPlanet(37.53, 127.02);
      return experienceFlag;
    },
  },
  {
    create: () => {
      const alien = new StaticModel(
        "alien",
        "Jane Doe",
        true,
        -0.5,
        2.5,
        undefined,
        models.alien
      );
      alien.setPositionOnPlanet(22.9, -20.1);
      return alien;
    },
  },
  {
    create: () => {
      const iss = new StaticModel(
        "iss",
        "ISS",
        false,
        100,
        5,
        undefined,
        models.iss
      );
      iss.setPositionOnPlanet(71.6, 11.5);
      return iss;
    },
  },
  {
    create: () => {
      const earth = new StaticModel(
        "earth",
        "Earth",
        false,
        100,
        10,
        undefined,
        models.earth
      );
      earth.setScale(0.05);
      earth.setPositionOnPlanet(71.6, 71.6);
      return earth;
    },
  },
  {
    create: () => {
      const astronaut = new StaticModel(
        "astronaut",
        "Astronaut",
        false,
        40,
        2,
        undefined,
        models.astronaut
      );
      astronaut.setPositionOnPlanet(57.3, -28.6);
      astronaut.setScale(2);
      astronaut.getMesh().rotation.y = -Math.PI / 4;
      return astronaut;
    },
  },
  {
    create: () => {
      const cow = new AnimatedModel(
        "friendly-cow",
        "Bessie",
        true,
        -1,
        3,
        undefined,
        models.cow
      );
      cow.setPositionOnPlanet(30, 30);
      cow.setScale(2);
      cow.setInitialAnimation("Attack_Headbutt");

      const cowConversation = {
        title: "Friendly Cow",
        icon: "🐄",
        messages: [
          "Moooo! Welcome to my meadow!",
          "I love walking around this planet!",
          "The view from up here is amazing!",
        ],
      };
      cow.setConversation(cowConversation);
      return cow;
    },
  },
];
