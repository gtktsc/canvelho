"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvelho } from "./Canvelho";
import { Position, Range, Styles, Text } from "./types";

const useCanvasDrawing = (
  canvas: HTMLCanvasElement | null,
  isReady: boolean
) => {
  const [text, setText] = useState<Text>([]);
  const [styles, setStyles] = useState<Styles>([]);
  const [caretPosition, setCaretPosition] = useState<Position | null>(null);
  const [rangePosition, setRangePosition] = useState<Range | null>(null);
  const [canvelho, setCanvelho] = useState<Canvelho | null>(null);

  useEffect(() => {
    if (canvas) {
      setCanvelho(
        new Canvelho({
          canvas,
          text: "1234\nabcdefghijklmno\nEFGH",
          onChange: ({ text, styles, caret, range }) => {
            setText(text);
            setStyles(styles);
            setCaretPosition(caret);
            setRangePosition(range);
          },
        })
      );
    }
  }, [canvas, isReady]);

  useEffect(() => {
    if (canvelho) {
      canvelho.setOnChange(({ text, styles, caret, range }) => {
        setText(text);
        setStyles(styles);
        setCaretPosition(caret);
        setRangePosition(range);
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

  const { canvelho, text, styles, rangePosition, caretPosition } =
    useCanvasDrawing(canvasRef.current, isReady);

  const currentStyles = canvelho?.getStyle(
    rangePosition?.start || caretPosition
  );

  const toggleItalic = useCallback(() => {
    const currentStyle = currentStyles?.fontStyle;
    const toggled = currentStyle === "italic" ? "normal" : "italic";
    canvelho?.setStyle(
      {
        fontStyle: toggled,
      },
      rangePosition || caretPosition
    );
  }, [currentStyles, canvelho, rangePosition, caretPosition]);

  const toggleLowercase = useCallback(() => {
    const toggled =
      currentStyles?.textTransform === "uppercase" ? "lowercase" : "uppercase";

    canvelho?.setStyle(
      {
        textTransform: toggled,
      },
      rangePosition || caretPosition
    );
  }, [currentStyles, canvelho, rangePosition, caretPosition]);


  return (
    <>
      <div>
        <input
          type="color"
          onChange={(e) => {
            canvelho?.setStyle(
              { color: e.target.value },
              rangePosition || caretPosition
            );
          }}
        />
        <button onClick={toggleItalic}>italic</button>
        <button
          onClick={() => {
            canvelho?.setStyle(
              { fontWeight: "bold" },
              rangePosition || caretPosition
            );
          }}
        >
          bold
        </button>
        <button
          onClick={() => {
            canvelho?.setStyle(
              { fontWeight: "normal" },
              rangePosition || caretPosition
            );
          }}
        >
          normal
        </button>
        <button onClick={toggleLowercase}>
          {currentStyles?.textTransform === "uppercase"
            ? "uppercase"
            : "lowercase"}
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
