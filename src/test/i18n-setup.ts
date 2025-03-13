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
        "playerName.title": "Welcome to Shinyeong Planet",
        "playerName.enterName": "Please enter your name:",
        "playerName.placeholder": "Your name here",
        "playerName.start": "Start Journey",
        "playerName.error": "Name cannot be empty",
        "playerName.display": "Explorer: {{name}}",
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
        "language.fr": "Français",
        "language.zh-CN": "简体中文",
        "language.zh-TW": "繁體中文",
        "language.de": "Deutsch",
        "language.ja": "日本語",
        "playerName.edit": "Change Name",
        "playerName.editTitle": "Change Your Explorer Name",
        "playerName.save": "Save",
        "playerName.cancel": "Cancel",
      },
    },
    ko: {
      translation: {
        gameName: "신영 행성",
        "playerName.title": "신영 행성에 오신 것을 환영합니다",
        "playerName.enterName": "이름을 입력해주세요:",
        "playerName.placeholder": "이름 입력",
        "playerName.start": "탐험 시작",
        "playerName.error": "이름은 비어있을 수 없습니다",
        "playerName.display": "탐험가: {{name}}",
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
        "language.ko": "한국어",
        "playerName.edit": "이름 변경",
        "playerName.editTitle": "탐험가 이름 변경",
        "playerName.save": "저장",
        "playerName.cancel": "취소",
      },
    },
    // For testing, we only need detailed translations for a few languages
    // Other languages can be included with minimal translations
    fr: {
      translation: {
        gameName: "Planète Shinyeong",
        "language.title": "Langue",
      },
    },
    "zh-CN": {
      translation: {
        gameName: "新英星球",
        "language.title": "语言",
      },
    },
    "zh-TW": {
      translation: {
        gameName: "新英星球",
        "language.title": "語言",
      },
    },
    de: {
      translation: {
        gameName: "Shinyeong Planet",
        "language.title": "Sprache",
      },
    },
    ja: {
      translation: {
        gameName: "シンヨン惑星",
        "language.title": "言語",
      },
    },
  },
  interpolation: {
    escapeValue: false, // not needed for react
  },
  debug: false,
});

export default i18n;
