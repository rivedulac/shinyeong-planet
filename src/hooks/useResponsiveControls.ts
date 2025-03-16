import { useEffect, useState } from "react";

export function useResponsiveControls() {
  const [controlScale, setControlScale] = useState(1);

  useEffect(() => {
    const updateControlScale = () => {
      // Scale down controls on smaller screens
      if (window.innerWidth < 768) {
        const scaleFactor = Math.max(0.7, window.innerWidth / 768);
        document.documentElement.style.setProperty(
          "--control-scale",
          scaleFactor.toString()
        );
        setControlScale(scaleFactor);
      } else {
        document.documentElement.style.setProperty("--control-scale", "1");
        setControlScale(1);
      }
    };

    // Set initial scale
    updateControlScale();

    // Update on resize
    window.addEventListener("resize", updateControlScale);
    return () => window.removeEventListener("resize", updateControlScale);
  }, []);

  return controlScale;
}
