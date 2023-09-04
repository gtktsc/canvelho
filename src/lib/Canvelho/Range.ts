import { Position, Range as RangeType, BoundingBoxes, Styles } from "./types";
import {
  compareTwoPositions,
  getBoundingBoxCenterX,
  getNearestLetterPosition,
  getWordBounds,
} from "./utils";

export class Range {
  public currentText: string[] = [];

  public onChange: () => void;
  public onEnd: (range: RangeType) => void;

  public position: RangeType | null = null;
  public boundingBoxes: BoundingBoxes = [[]];
  public styles: Styles = [[]];

  public isSelecting: boolean = false;
  public startingPoint: Position | null = null;
  constructor({
    onChange,
    onEnd,
  }: {
    onChange: () => void;
    onEnd: (range: RangeType) => void;
  }) {
    this.onChange = onChange;
    this.onEnd = onEnd;
  }

  public updatePosition(position: RangeType | null) {
    if (
      compareTwoPositions(this.position?.start, position?.start) &&
      compareTwoPositions(this.position?.end, position?.end)
    ) {
      return;
    }

    this.position = position;
    this.onChange();
  }

  public resetPosition() {
    this.updatePosition(null);
  }

  onMouseDown(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const clickedBoundingBox = getNearestLetterPosition(
      offsetX,
      offsetY,
      this.boundingBoxes,
      this.styles
    );

    if (!clickedBoundingBox) return;
    const { line, index } = clickedBoundingBox;
    const boundingBoxCenter = getBoundingBoxCenterX(
      line,
      index,
      this.boundingBoxes
    );

    const clickedPosition =
      boundingBoxCenter && offsetX > boundingBoxCenter
        ? { line, index: index + 1 }
        : { line, index };

    this.startingPoint = clickedPosition;
    this.updatePosition(null);
  }

  onDoubleClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const clickedBoundingBox = getNearestLetterPosition(
      offsetX,
      offsetY,
      this.boundingBoxes,
      this.styles
    );

    if (!clickedBoundingBox) return;
    const { line, index } = clickedBoundingBox;

    this.updatePosition({
      start: { line, index },
      end: { line, index: index + 1 },
    });
  }

  onClick(event: MouseEvent) {
    if (event.detail === 3) {
      const { offsetX, offsetY } = event;
      const clickedBoundingBox = getNearestLetterPosition(
        offsetX,
        offsetY,
        this.boundingBoxes,
        this.styles
      );
      if (!clickedBoundingBox) return;

      const { line, index } = clickedBoundingBox;
      const wordBounds = getWordBounds(line, index, this.currentText[line]);

      if (wordBounds) {
        this.updatePosition(wordBounds);
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.startingPoint) return;
    const { offsetX, offsetY } = event;
    const hoveredBoundingBox = getNearestLetterPosition(
      offsetX,
      offsetY,
      this.boundingBoxes,
      this.styles
    );

    if (!hoveredBoundingBox) return;

    const { line, index } = hoveredBoundingBox;
    const boundingBoxCenter = getBoundingBoxCenterX(
      line,
      index,
      this.boundingBoxes
    );
    const end =
      boundingBoxCenter && offsetX > boundingBoxCenter
        ? { line, index: index + 1 }
        : { line, index };

    const start = this.startingPoint;

    const startLine = Math.min(start.line, end.line);
    const endLine = Math.max(start.line, end.line);
    let startIdx = start.line === startLine ? start.index : end.index;
    let endIdx = end.line === endLine ? end.index : start.index;

    if (startLine === endLine && startIdx > endIdx) {
      const temp = startIdx;
      startIdx = endIdx;
      endIdx = temp;
    }

    this.updatePosition({
      start: { line: startLine, index: startIdx },
      end: { line: endLine, index: endIdx },
    });
  }

  onMouseUp() {
    if (this.position?.end) {
      this.onEnd(this.position);
    }
    this.startingPoint = null;
  }
}
