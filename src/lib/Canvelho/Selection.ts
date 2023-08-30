import { Caret } from "./Caret";
import { Events } from "./Events";
import { Range } from "./Range";
import { Range as RangeType } from "./types";

export class Selection extends Events {
  public caret: Caret;
  public range: Range;

  constructor({
    canvas,
    onChange,
  }: {
    canvas: HTMLCanvasElement;
    onChange: () => void;
  }) {
    super(canvas);

    this.caret = new Caret({ onChange: () => onChange() });
    this.range = new Range({
      onChange: () => onChange(),
      onEnd: (range: RangeType) => {
        this.caret.updatePosition(range?.end);
      },
    });
  }

  onKeyDown(event: KeyboardEvent) {
    this.caret.onKeyDown(event);
  }

  onClick(event: MouseEvent) {
    if (!this.range.position) this.caret.onClick(event);
    this.range.onClick(event);
  }

  onMouseDown(event: MouseEvent) {
    this.range.onMouseDown(event);
  }

  onDoubleClick(event: MouseEvent): void {
    this.range.onDoubleClick(event);
    this.caret.onDoubleClick(event);
  }

  onMouseMove(event: MouseEvent): void {
    this.range.onMouseMove(event);
  }

  onMouseUp(): void {
    this.range.onMouseUp();
  }
}
