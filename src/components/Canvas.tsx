"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvelho } from "./Canvelho";

const useCanvasDrawing = (
  canvas: HTMLCanvasElement | null,
  isReady: boolean
) => {
  const [canvelho, setCanvelho] = useState<Canvelho | null>(null);

  useEffect(() => {
    if (canvas) {
      setCanvelho(new Canvelho(canvas));
    }
  }, [canvas, isReady]);
  return canvelho;
};

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    setTimeout(() => {
      setIsReady(true);
    });
  }

  useCanvasDrawing(canvasRef.current, isReady);

  return (
    <div>
      <canvas tabIndex={1} ref={canvasRef} width={500} height={500} />
    </div>
  );
};

export default CanvasComponent;
