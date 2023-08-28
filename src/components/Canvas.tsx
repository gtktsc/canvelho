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
  }, [canvas, isReady]);  return canvelho;
};

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    setTimeout(() => {
      setIsReady(true);
    });
  }

  const canvhelho = useCanvasDrawing(canvasRef.current, isReady);

  return (
    <>
      <div>
        <input
          type="color"
          onChange={(e) => {
            canvhelho?.setStyle(
              { color: e.target.value },
              canvhelho?.selectionRange
            );
          }}
        />
        <button
          onClick={() => {
            canvhelho?.setStyle(
              { fontStyle: "italic" },
              canvhelho.selectionRange
            );
          }}
        >
          italic
        </button>
        <button
          onClick={() => {
            canvhelho?.setStyle(
              { fontWeight: "bold" },
              canvhelho.selectionRange
            );
          }}
        >
          bold
        </button>
        <button
          onClick={() => {
            canvhelho?.setStyle(
              { fontWeight: "normal" },
              canvhelho.selectionRange
            );
          }}
        >
          normal
        </button>
        <button
          onClick={() => {
            canvhelho?.setStyle(
              { textTransform: "uppercase" },
              canvhelho.selectionRange
            );
          }}
        >
          uppercase
        </button>
      </div>
      <div>
        <canvas
          style={{ border: "1px solid red", outline: "none" }}
          tabIndex={1}
          ref={canvasRef}
          width={500}
          height={500}
        />
      </div>
    </>
  );
};

export default CanvasComponent;
