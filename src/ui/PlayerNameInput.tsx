import { BACKGROUND_COLOR_RGBA } from "@/config/constants";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface PlayerNameInputProps {
  onNameSubmit: (name: string) => void;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({ onNameSubmit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation - name must be at least 1 character
    if (name.trim().length < 1) {
      setIsError(true);
      return;
    }

    onNameSubmit(name.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (isError && e.target.value.trim().length >= 1) {
      setIsError(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: BACKGROUND_COLOR_RGBA,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(127, 127, 127, 0.3)",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "450px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            color: "white",
            marginBottom: "30px",
            fontFamily: "sans-serif",
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "normal",
          }}
        >
          {t("playerName.title")}
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="playerName"
            style={{
              color: "white",
              marginBottom: "15px",
              fontFamily: "sans-serif",
              fontSize: "18px",
            }}
          >
            {t("playerName.enterName")}
          </label>

          <input
            id="playerName"
            type="text"
            value={name}
            onChange={handleChange}
            placeholder={t("playerName.placeholder")}
            style={{
              width: "80%",
              maxWidth: "350px",
              padding: "12px",
              fontSize: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: isError ? "2px solid #ff3333" : "2px solid transparent",
              borderRadius: "5px",
              marginBottom: "10px",
              textAlign: "center",
            }}
            autoFocus
          />

          {isError && (
            <div
              style={{
                color: "#ff3333",
                marginBottom: "15px",
                fontFamily: "sans-serif",
                fontSize: "14px",
              }}
            >
              {t("playerName.error")}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "80%",
              maxWidth: "350px",
              padding: "14px",
              backgroundColor: "rgba(64, 128, 255, 0.9)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              fontFamily: "sans-serif",
              marginTop: "20px",
            }}
          >
            {t("playerName.start")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInput;
