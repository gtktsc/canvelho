import { Position, Range as RangeType, BoundingBoxes } from "./types";
import {
  compareTwoPositions,
  findBoundingBoxAtPosition,
  getBoundingBoxCenterX,
} from "./utils";

export class Range {
  public onChange: () => void;
  public onEnd: (range: RangeType) => void;

  public position: RangeType | null = null;
  public boundingBoxes: BoundingBoxes = [[]];

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
    const clickedBoundingBox = findBoundingBoxAtPosition(
      offsetX,
      offsetY,
      this.boundingBoxes
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
    const clickedBoundingBox = findBoundingBoxAtPosition(
      offsetX,
      offsetY,
      this.boundingBoxes
    );

    if (!clickedBoundingBox) return;
    const { line, index } = clickedBoundingBox;

    this.updatePosition({
      start: { line, index },
      end: { line, index: index + 1 },
    });
  }

  onMouseMove(event: MouseEvent) {
    if (!this.startingPoint) return;
    const { offsetX, offsetY } = event;
    const hoveredBoundingBox = findBoundingBoxAtPosition(
      offsetX,
      offsetY,
      this.boundingBoxes
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
