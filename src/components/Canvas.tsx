"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvelho } from "../lib/Canvelho";
import { Position, Range, Styles, Text } from "../lib/Canvelho/types";

import {
  RxLetterCaseLowercase,
  RxLetterCaseUppercase,
  RxFontBold,
  RxFontItalic,
  RxReset,
} from "react-icons/rx";

const useCanvasDrawing = (
  canvas: HTMLCanvasElement | null,
  isReady: boolean
) => {
  const [_, setUpdate] = useState({});
  const [text, setText] = useState<Text>([]);
  const [styles, setStyles] = useState<Styles>([]);
  const [caretPosition, setCaretPosition] = useState<Position | null>(null);
  const [rangePosition, setRangePosition] = useState<Range | null>(null);
  const [canvelho, setCanvelho] = useState<Canvelho | null>(null);

  const setCanvasSize = useCallback(() => {
    if (canvas) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  }, [canvas]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", setCanvasSize);
    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [setCanvasSize]);

  useEffect(() => {
    if (canvas) {
      setCanvasSize();

      setCanvelho(
        new Canvelho({
          canvas,
          text: "Simple rich text editor in canvas\nstill in development",
        })
      );
    }
  }, [canvas, isReady, setCanvasSize]);

  useEffect(() => {
    if (canvelho) {
      canvelho.setOnChange(({ text, styles, caret, range }) => {
        setText(text);
        setStyles(styles);
        setCaretPosition(caret);
        setRangePosition(range);
        setUpdate({});
      });
    }
  }, [canvelho, setText, setStyles, setCaretPosition, setRangePosition]);

  if (typeof window !== "undefined") {
    //@ts-ignore
    window.canvelho = canvelho;
  }
  return { canvelho, text, styles, rangePosition, caretPosition };
};

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    setTimeout(() => {
      setIsReady(true);
    });
  }

  const { canvelho, rangePosition, caretPosition } = useCanvasDrawing(
    canvasRef.current,
    isReady
  );

  const currentStyles = canvelho?.getStyle(
    rangePosition?.start || caretPosition
  );

  const toggleItalic = useCallback(() => {
    const currentStyle = currentStyles?.fontStyle;
    const toggled = currentStyle === "italic" ? "normal" : "italic";
    canvelho?.setStyle({
      fontStyle: toggled,
    });
  }, [currentStyles, canvelho]);

  const toggleLowercase = useCallback(() => {
    const toggled =
      currentStyles?.textTransform === "uppercase" ? "lowercase" : "uppercase";

    canvelho?.setStyle({
      textTransform: toggled,
    });
  }, [currentStyles, canvelho]);

  const toggleBold = useCallback(() => {
    const toggled = currentStyles?.fontWeight === "bold" ? "normal" : "bold";

    canvelho?.setStyle({
      fontWeight: toggled,
    });
  }, [currentStyles, canvelho]);

  return (
    <>
      <section id="controls-wrapper">
        <input
          type="color"
          value={currentStyles?.color}
          onChange={(e) => {
            canvelho?.setStyle({ color: e.target.value });
          }}
        />
        <input
          type="range"
          min={10}
          max={50}
          value={currentStyles?.fontSize}
          onChange={(e) => {
            canvelho?.setStyle({ fontSize: Number(e.target.value) });
          }}
        />
        <button onClick={toggleItalic}>
          <RxFontItalic
            color={currentStyles?.fontStyle === "italic" ? "black" : "grey"}
          />
        </button>
        <button onClick={toggleBold}>
          <RxFontBold
            color={currentStyles?.fontWeight === "bold" ? "black" : "grey"}
          />
        </button>
        <button
          onClick={() => {
            canvelho?.setStyle({
              fontWeight: "normal",
              fontStyle: "normal",
              textTransform: "none",
              fontSize: 20,
            });
          }}
        >
          <RxReset />
        </button>
        <button onClick={toggleLowercase}>
          {currentStyles?.textTransform === "uppercase" ? (
            <RxLetterCaseUppercase />
          ) : (
            <RxLetterCaseLowercase />
          )}
        </button>
      </section>
      <section id="canvas-wrapper">
        <canvas tabIndex={1} ref={canvasRef} />
      </section>
    </>
  );
};

export default CanvasComponent;
