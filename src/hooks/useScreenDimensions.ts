import { throttle } from "lodash";
import { useEffect, useState } from "react";

export const useScreenDimensions = (): { width: number; height: number } => {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    const onResize = throttle(() => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }, 200);

    window.addEventListener("load", onResize, false);
    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("load", onResize, false);
      window.removeEventListener("resize", onResize, false);
    };
  }, []);

  return { width, height };
};
