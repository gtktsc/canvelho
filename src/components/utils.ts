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
  const letterBox = boundingBoxes[line][index];
  return letterBox.x + letterBox.width / 2;
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
      start: { line, index: wordStartIndex },
      end: { line, index: endIndex },
    };
  }
  return null;
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
