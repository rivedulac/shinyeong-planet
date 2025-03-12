import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Initialize i18next for tests
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  // Use simple key-value pairs for testing
  resources: {
    en: {
      translation: {
        gameName: "Shinyeong Planet",
        "cameraPosition.title": "Camera Position",
        "cameraPosition.x": "X: {{value}}",
        "cameraPosition.y": "Y: {{value}}",
        "cameraPosition.z": "Z: {{value}}",
        "cameraPosition.yaw": "Yaw: {{value}}",
        "cameraPosition.pitch": "Pitch: {{value}}",
        "cameraPosition.roll": "Roll: {{value}}",
        "controls.title": "Controls:",
        "controls.moveForward": "W - Move Forward",
        "controls.moveBackward": "S - Move Backward",
        "controls.rotateLeft": "A - Rotate Left",
        "controls.rotateRight": "D - Rotate Right",
        "controls.lookUp": "↑ - Look Up",
        "controls.lookDown": "↓ - Look Down",
        "controls.zoomIn": "+ - Zoom In (Decrease FOV)",
        "controls.zoomOut": "- - Zoom Out (Increase FOV)",
        "language.title": "Language",
        "language.en": "English",
        "language.ko": "한국어",
      },
    },
    ko: {
      translation: {
        gameName: "신영 행성",
        "cameraPosition.title": "카메라 위치",
        "cameraPosition.x": "X: {{value}}",
        "cameraPosition.y": "Y: {{value}}",
        "cameraPosition.z": "Z: {{value}}",
        "cameraPosition.pitch": "Pitch: {{value}}",
        "cameraPosition.yaw": "Yaw: {{value}}",
        "cameraPosition.roll": "Roll: {{value}}",
        "controls.title": "조작법:",
        "controls.moveForward": "W - 앞으로 이동",
        "controls.moveBackward": "S - 뒤로 이동",
        "controls.rotateLeft": "A - 왼쪽으로 회전",
        "controls.rotateRight": "D - 오른쪽으로 회전",
        "controls.lookUp": "↑ - 위쪽 보기",
        "controls.lookDown": "↓ - 아래쪽 보기",
        "controls.zoomIn": "+ - 확대 (FOV 감소)",
        "controls.zoomOut": "- - 축소 (FOV 증가)",
        "language.title": "언어",
        "language.en": "English",
      },
    },
  },
  interpolation: {
    escapeValue: false, // not needed for react
  },
  debug: false,
});

export default i18n;
