// src/ui/NameEditModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface NameEditModalProps {
  currentName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const NameEditModal: React.FC<NameEditModalProps> = ({
  currentName,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(currentName);
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation - name must be at least 1 character
    if (name.trim().length < 1) {
      setIsError(true);
      return;
    }

    onSave(name.trim());
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
        backgroundColor: "rgba(0, 0, 0, 0)",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1001,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(20, 20, 40, 0.8)",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "450px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            color: "white",
            marginBottom: "20px",
            fontFamily: "sans-serif",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "normal",
          }}
        >
          {t("playerName.editTitle")}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <input
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

          <div
            style={{
              display: "flex",
              width: "80%",
              maxWidth: "350px",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "rgba(150, 150, 150, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {t("playerName.cancel")}
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "rgba(64, 128, 255, 0.9)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {t("playerName.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameEditModal;
