import { BoundingBoxes, Position, Styles } from "./types";
import {
  compareTwoPositions,
  findLineAtPosition,
  getNearestLetterPosition,
  getWordBounds,
} from "./utils";

export class Caret {
  public currentText: string[] = [];
  public onChange: () => void;
  public position: Position = { line: 0, index: 0 };
  public boundingBoxes: BoundingBoxes = [[]];
  public styles: Styles = [[]];

  constructor({ onChange }: { onChange: () => void }) {
    this.onChange = onChange;
  }

  public updatePosition(position: Position) {
    if (compareTwoPositions(this.position, position)) {
      return;
    }

    this.position = position;
    this.onChange();
  }

  public onKeyDown(event: KeyboardEvent) {
    const { line, index } = this.position;
    const lineText = this.boundingBoxes[line];
    if (event.metaKey || event.ctrlKey) return;

    if (event.key === "ArrowLeft") {
      if (index > 0) {
        this.updatePosition({ line, index: index - 1 });
      } else if (line > 0) {
        this.updatePosition({
          line: line - 1,
          index: this.boundingBoxes[line - 1].length,
        });
      }
    } else if (event.key === "ArrowRight") {
      if (index < (lineText ? lineText.length : 0)) {
        this.updatePosition({ line, index: index + 1 });
      } else if (line < this.boundingBoxes.length - 1) {
        this.updatePosition({ line: line + 1, index: 0 });
      }
    } else if (event.key === "ArrowUp") {
      if (line > 0) {
        const prevLineText = this.boundingBoxes[line - 1];
        const newIndex = Math.min(index, prevLineText.length);
        this.updatePosition({ line: line - 1, index: newIndex });
      }
    } else if (event.key === "ArrowDown") {
      if (line < this.boundingBoxes.length - 1) {
        const nextLineText = this.boundingBoxes[line + 1];
        const newIndex = Math.min(index, nextLineText.length);
        this.updatePosition({ line: line + 1, index: newIndex });
      }
    } else if (event.key === "Delete") {
      if (index < lineText.length) {
        this.updatePosition({ line, index });
      } else if (line < this.boundingBoxes.length - 1) {
        this.updatePosition({ line, index: lineText.length });
      }
    } else if (event.key === "Enter") {
      this.updatePosition({ line: line + 1, index: 0 });
    } else if (event.key === "Backspace") {
      if (index > 0) {
        this.updatePosition({ line, index: index - 1 });
      } else if (line > 0) {
        this.updatePosition({
          line: line - 1,
          index: this.boundingBoxes[line - 1].length,
        });
      }
    } else if (event.key.length === 1) {
      this.updatePosition({ line, index: index + 1 });
    }
  }

  public onClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const clickedBoundingBox = getNearestLetterPosition(
      offsetX,
      offsetY,
      this.boundingBoxes,
      this.styles
    );
    if (clickedBoundingBox) {
      const { line, index } = clickedBoundingBox;
      if (event.detail === 3) {
        const wordBounds = getWordBounds(line, index, this.currentText[line]);

        if (wordBounds) {
          this.updatePosition({ ...wordBounds.end });
        }
      } else {
        this.updatePosition({ line, index });
      }
      return;
    }
    const clickedLine = findLineAtPosition(offsetY, this.boundingBoxes);

    if (clickedLine !== null) {
      this.updatePosition({
        line: clickedLine,
        index: this.boundingBoxes[clickedLine].length,
      });
      return;
    }
  }

  public onDoubleClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const clickedBoundingBox = getNearestLetterPosition(
      offsetX,
      offsetY,
      this.boundingBoxes,
      this.styles
    );

    if (clickedBoundingBox) {
      const { line, index } = clickedBoundingBox;
      this.updatePosition({ line, index: index + 1 });
    }
  }
}
