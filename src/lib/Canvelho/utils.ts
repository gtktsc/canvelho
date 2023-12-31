import { defaultStyles } from "./constants";
import { BoundingBoxes, Position, Style, Range, Text } from "./types";

export const compareTwoPositions = (
  firstPosition?: Position,
  secondPosition?: Position
) =>
  firstPosition?.line === secondPosition?.line &&
  firstPosition?.index === secondPosition?.index;

export const getBoundingBoxCenterX = (
  line: number,
  index: number,
  boundingBoxes: BoundingBoxes
): number | null => {
  const letterBox = boundingBoxes[line]?.[index];
  return letterBox?.x + letterBox?.width / 2;
};

export const getLinePosition = (
  line: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][]
) => {
  const lineBoundingBox = boundingBoxes[line];
  const firstLetter = lineBoundingBox?.[0];
  const lastLetter = lineBoundingBox?.[lineBoundingBox?.length - 1];
  let height = 0;
  let positionY = 0;

  const firstLetterX = firstLetter?.x || 0;
  const lastLetterX = lastLetter?.x || 0;
  const lastLetterWidth = lastLetter?.width || 0;

  for (let i = 0; i < lineBoundingBox?.length; i++) {
    const letterBox = lineBoundingBox[i];
    positionY = Math.max(
      positionY,
      letterBox.y + letterBox.actualBoundingBoxAscent
    );
    height = Math.max(getLineHeight(styles, line), height);
  }

  return {
    x: firstLetterX,
    y: positionY - height,
    width: lastLetterX + lastLetterWidth - firstLetterX,
    height: height,
  };
};

export const getLineBoundingBoxPosition = (
  line: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][]
) => {
  const lineBoundingBox = boundingBoxes[line];
  const firstLetter = lineBoundingBox[0];
  const lastLetter = lineBoundingBox[lineBoundingBox.length - 1];
  let height = 0;
  let positionY = 0;

  const firstLetterX = firstLetter?.x || 0;
  const lastLetterX = lastLetter?.x || 0;
  const lastLetterWidth = lastLetter?.width || 0;

  for (let i = 0; i < lineBoundingBox.length; i++) {
    const letterBox = lineBoundingBox[i];
    positionY = Math.max(
      positionY,
      letterBox.y + letterBox.actualBoundingBoxAscent
    );
    height = Math.max(getLineHeight(styles, line), height);
  }

  return {
    x: firstLetterX,
    width: lastLetterX + lastLetterWidth - firstLetterX,
    y: positionY - height,
    height: height * 2,
  };
};

export const getNearestLinePosition = (
  x: number,
  y: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][]
): number | null => {
  let line = 0;

  for (let i = 0; i < boundingBoxes.length; i++) {
    const box = boundingBoxes[i];

    const lineBoundingBox = getLineBoundingBoxPosition(
      i,
      boundingBoxes,
      styles
    );

    if (i === 0 && y <= lineBoundingBox.y + lineBoundingBox.height) {
      return 0;
    } else if (i === boundingBoxes.length - 1 && y >= lineBoundingBox.y) {
      return boundingBoxes.length - 1;
    } else {
      for (let j = 0; j < box.length; j++) {
        if (
          y >= lineBoundingBox.y &&
          y <= lineBoundingBox.y + lineBoundingBox.height
        ) {
          line = i;
          return i;
        }
      }
    }
  }

  return null;
};

export const getNearestLetterPosition = (
  x: number,
  y: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][]
) => {
  const nearestLine = getNearestLinePosition(x, y, boundingBoxes, styles);

  if (nearestLine === null) {
    return null;
  }

  const line = boundingBoxes[nearestLine];
  for (let i = 0; i < line.length; i++) {
    const letterBox = line[i];
    if (i === 0 && x <= letterBox.x + letterBox.width) {
      return { line: nearestLine, index: 0 };
    } else if (i === line.length - 1 && x >= letterBox.x + letterBox.width) {
      return { line: nearestLine, index: line.length };
    } else if (x >= letterBox.x && x <= letterBox.x + letterBox.width) {
      return { line: nearestLine, index: i };
    }
  }
};

export const findBoundingBoxAtPosition = (
  x: number,
  y: number,
  boundingBoxes: BoundingBoxes
): Position | null => {
  for (let i = 0; i < boundingBoxes.length; i++) {
    const box = boundingBoxes[i];
    for (let j = 0; j < box.length; j++) {
      const letterBox = box[j];
      if (
        x >= letterBox.x &&
        x <= letterBox.x + letterBox.width &&
        y >= letterBox.y &&
        y <= letterBox.y + letterBox.height
      ) {
        return { line: i, index: j };
      }
    }
  }
  return null;
};
export const findNearBoundingBox = (
  x: number,
  y: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][]
): Position | null => {
  for (let i = 0; i < boundingBoxes.length; i++) {
    const lineBoundingBox = getLineBoundingBoxPosition(
      i,
      boundingBoxes,
      styles
    );

    const box = boundingBoxes[i];
    for (let j = 0; j < box.length; j++) {
      const letterBox = box[j];
      if (
        x >= letterBox.x &&
        x <= letterBox.x + letterBox.width &&
        y >= lineBoundingBox.y &&
        y <= lineBoundingBox.y + lineBoundingBox.height
      ) {
        return { line: i, index: j };
      }
    }
  }
  return null;
};

export const findLineAtPosition = (
  y: number,
  boundingBoxes: BoundingBoxes
): number | null => {
  for (let i = 0; i < boundingBoxes.length; i++) {
    const box = boundingBoxes[i];
    for (let j = 0; j < box.length; j++) {
      const letterBox = box[j];
      if (y >= letterBox.y && y <= letterBox.y + letterBox.height) {
        return i;
      }
    }
  }
  return null;
};

export const getWordBounds = (
  line: number,
  index: number,
  lineText: string
): {
  start: Position;
  end: Position;
} | null => {
  if (index >= 0 && index < lineText.length) {
    const wordStartIndex = lineText.lastIndexOf(" ", index) + 1;
    const wordEndIndex = lineText.indexOf(" ", index);
    const endIndex = wordEndIndex !== -1 ? wordEndIndex : lineText.length;

    return {
      start: { line, index: Math.min(endIndex, wordStartIndex) },
      end: { line, index: Math.max(endIndex, wordStartIndex) },
    };
  }
  return null;
};

export const getLineHeight = (styles: Style[][], line: number) => {
  let lineHeight = 0;
  for (let i = 0; i <= styles[line].length; i++) {
    const style = styles[line][i];
    if (style?.lineHeight) {
      lineHeight = Math.max(style.lineHeight, lineHeight);
    } else {
      const currentStyle = getPreviousStyles(styles, { line, index: i });

      if (currentStyle?.lineHeight) {
        lineHeight = Math.max(currentStyle?.lineHeight, lineHeight);
      }
    }
  }

  return lineHeight;
};

export const getTextAlignInitialPosition = (
  line: number,
  boundingBoxes: BoundingBoxes,
  styles: Style[][],
  context: CanvasRenderingContext2D
) => {
  const editorWidth = context.canvas.width;
  const { width } = getLinePosition(line, boundingBoxes, styles);
  const textAlign = getPreviousStyles(styles, { line, index: 0 })?.textAlign;
  if (textAlign === "left") {
    return 0;
  } else if (textAlign === "center") {
    return (editorWidth - width) / 2;
  } else if (textAlign === "right") {
    return editorWidth - width;
  }
  return 0;
};

export const getPreviousStyles = (
  styles: Style[][],
  position: Position
): Style => {
  if (!position) return defaultStyles;

  let letterStyle = styles[position.line][position.index];
  if (!letterStyle) {
    if (position.index === 0 && position.line === 0) {
      return defaultStyles;
    }

    if (position.index === 0) {
      const lineLength = styles[position.line - 1].length;
      return getPreviousStyles(styles, {
        line: position.line - 1,
        index: lineLength > 0 ? lineLength - 1 : 0,
      });
    }

    return getPreviousStyles(styles, {
      line: position.line,
      index: position.index - 1,
    });
  }
  return letterStyle;
};

export const prepareText = (text: string): string[] => {
  return text.split("\n");
};

export const getStyledLetter = (currentLetter: string, letterStyle: Style) => {
  let letter = currentLetter;

  if (letterStyle.textTransform === "uppercase") {
    letter = currentLetter.toUpperCase();
  } else if (letterStyle.textTransform === "lowercase") {
    letter = currentLetter.toLowerCase();
  }

  return letter;
};

export const forAllInRange = (
  range: Range | null,
  text: Text,
  callback: (position: Position, iterator: number) => void
) => {
  if (range) {
    const { start, end } = range;
    for (let line = start.line; line <= end.line; line++) {
      const currentLine = text[line];

      let lineLength = 0;

      if (line === start.line && line !== end.line) {
        lineLength = currentLine.length;
      } else if (line === start.line) {
        lineLength = end.index;
      } else if (line === end.line) {
        lineLength = end.index;
      } else {
        lineLength = currentLine.length;
      }

      let startIndex = 0;

      if (line === start.line && line !== end.line) {
        startIndex = start.index;
      } else if (line === start.line) {
        startIndex = start.index;
      } else if (line === end.line) {
        startIndex = 0;
      } else {
        startIndex = 0;
      }

      let iterator = 0;
      for (let index = startIndex; index <= lineLength - 1; index++) {
        callback({ line, index }, iterator);
        iterator++;
      }
    }
  }
};
