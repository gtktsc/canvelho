import { Events } from "./Events";
import { Selection } from "./Selection";
import { Text } from "./Text";
import {
  Style,
  Position,
  Text as TextType,
  Range as RangeType,
  BoundingBoxes,
  Styles,
} from "./types";
import { getPreviousStyles, getStyledLetter, prepareText } from "./utils";

export class Canvelho extends Events {
  private context: CanvasRenderingContext2D;
  public onChange?: ({
    text,
    styles,
    caret,
    range,
  }: {
    text: TextType;
    styles: Styles;
    caret: Position | null;
    range: RangeType | null;
  }) => void;
  public boundingBoxes: BoundingBoxes = [[]];

  public selection: Selection;
  private text: Text;
  private lineHeight: number = 60;

  constructor({
    canvas,
    text,
    onChange,
  }: {
    canvas: HTMLCanvasElement;
    text: string;
    onChange?: ({
      text,
      styles,
      range,
      caret,
    }: {
      text: TextType;
      styles: Styles;
      caret: Position | null;
      range: RangeType | null;
    }) => void;
  }) {
    super(canvas);
    if (!canvas) throw new Error("Canvas not found");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not found");
    this.context = context;
    this.onChange = onChange;

    this.selection = new Selection({ canvas, onChange: () => this.render() });
    this.text = new Text(prepareText(text));

    this.render();
    this.updateListeners();
  }

  public setOnChange(
    onChange: ({
      text,
      styles,
      caret,
      range,
    }: {
      text: TextType;
      styles: Styles;
      caret: Position | null;
      range: RangeType | null;
    }) => void
  ) {
    this.onChange = onChange;
  }

  private forAllInRange(
    callback: (position: Position, iterator: number) => void
  ) {
    if (this.selection.range.position) {
      const { start, end } = this.selection.range.position;
      for (let line = end.line; line >= start.line; line--) {
        const currentLine = this.text.getText().text[line];

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
        for (let index = lineLength - 1; index >= startIndex; index--) {
          callback({ line, index }, iterator);
          iterator++;
        }
      }
    }
  }

  public getStyle(position: Position | null): Style {
    if (position) {
      return this.text.getText().styles[position.line][position.index];
    }

    return this.text.getText().styles[this.selection.caret.position.line][
      this.selection.caret.position.index - 1
    ];
  }

  public setStyle(style: Style, position: Position | RangeType | null): void {
    if ((position as RangeType).start && (position as RangeType).end) {
      this.forAllInRange(({ line, index }) => {
        this.text.getText().styles[line][index] = {
          ...this.text.getText().styles[line][index],
          ...style,
        };
      });
    } else if (position) {
      const styles =
        this.text.getText().styles[(position as Position).line][
          (position as Position).index
        ];
      this.text.getText().styles[(position as Position).line][
        (position as Position).index
      ] = {
        ...styles,
        ...style,
      };
    } else {
      const lastLineNumber = this.text.getText().styles.length - 1;
      const lastLine = this.text.getText().styles[lastLineNumber];
      this.text.getText().styles[lastLineNumber][lastLine.length - 1] = {
        ...this.text.getText().styles[lastLineNumber][lastLine.length - 1],
        ...style,
      };
    }

    this.render();
  }

  private updateListeners() {
    this.selection.caret.boundingBoxes = this.boundingBoxes;
    this.selection.caret.currentText = this.text.getText().text;

    this.selection.range.boundingBoxes = this.boundingBoxes;
  }

  public render(): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.calculateBoundingBoxes();
    this.writeText();
    this.drawCaret();
    this.drawRange();

    this.onChange?.({
      text: this.text.getText().text,
      styles: this.text.getText().styles,
      caret: this.selection.caret.position,
      range: this.selection.range.position,
    });
  }

  private handleTextKeyActions(event: KeyboardEvent): void {
    const { position } = this.selection.caret;

    if (event.key === "Delete") {
      this.text.removeText({ line: position.line, index: position.index - 1 });
    } else if (event.key === "Enter") {
      this.text.insertNewLine(position);
    } else if (event.key === "Backspace") {
      this.text.removeText(position);
    } else if (event.key.length === 1) {
      this.text.insertText(event.key, position);
    }

    this.render();
  }

  private handleSelectionKeyActions(event: KeyboardEvent): void {
    const { start } = this.selection.range.position!;
    let newCaretPosition = start;

    if (event.key === "Escape") {
      this.selection.range.resetPosition();
    } else if (event.key === "Enter") {
      this.text.removeText(this.selection.range.position);
      this.text.insertNewLine(start);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      this.text.removeText(this.selection.range.position);

      newCaretPosition = {
        line: start.line,
        index: start.index + 1,
      };
    } else if (event.key.length === 1) {
      this.text.removeText(this.selection.range.position);
      this.text.insertText(event.key, start);
    }
    this.selection.range.resetPosition();
    this.selection.caret.updatePosition(newCaretPosition);
  }

  public onKeyDown(event: KeyboardEvent) {
    if (this.selection.range.position !== null) {
      this.handleSelectionKeyActions(event);
    } else if (this.selection.caret.position !== null) {
      this.handleTextKeyActions(event);
    }
    this.render();
  }

  public drawRange() {
    if (this.selection.range.position) {
      const { start, end } = this.selection.range.position;

      this.context.fillStyle = "rgba(0, 0, 255, 0.3)";

      for (let line = start.line; line <= end.line; line++) {
        const lineText = this.text.getText().text[line];
        if (this.boundingBoxes[line]) {
          const lineY =
            this.boundingBoxes[line][0]?.y ||
            0 - this.context.measureText(lineText).actualBoundingBoxAscent;

          const startX =
            line === start.line
              ? this.boundingBoxes[line][
                  start.index === lineText.length && lineText.length > 0
                    ? start.index - 1
                    : start.index
                ].x
              : this.boundingBoxes[line][0]?.x || 0;

          let width = 0;
          if (line === start.line && line === end.line) {
            width =
              this.boundingBoxes[line][Math.max(end.index - 1, 0)].x +
              this.boundingBoxes[line][Math.max(end.index - 1, 0)].width -
              startX;
          } else if (line === start.line) {
            width =
              this.boundingBoxes[line][lineText.length - 1].x +
              this.boundingBoxes[line][lineText.length - 1].width -
              startX;
          } else if (line === end.line) {
            let x =
              this.boundingBoxes[line][end.index]?.x ??
              this.boundingBoxes[line][this.boundingBoxes[line].length - 1]?.x +
                this.boundingBoxes[line][this.boundingBoxes[line].length - 1]
                  ?.width;

            width = x - startX;
          } else {
            width =
              this.boundingBoxes[line][lineText.length - 1]?.x +
              this.boundingBoxes[line][lineText.length - 1]?.width -
              startX;
          }

          this.context.fillRect(
            startX,
            lineY,
            width,
            this.boundingBoxes[line][0]?.height || 0
          );
        }
      }
    }
  }

  public drawCaret(): void {
    if (this.selection.caret.position !== null) {
      const { line, index } = this.selection.caret.position;
      const lineText = this.text.getText().text[line];

      if (lineText) {
        const textBeforeCaret = lineText.slice(0, index);
        const caretX = Array.from(textBeforeCaret).reduce(
          (previous, current, index) => {
            const styles = this.text.getText().styles;
            const letterStyle = getPreviousStyles(styles, { line, index });

            const letter = getStyledLetter(current, letterStyle);

            this.context.font = `${letterStyle.fontWeight} ${letterStyle.fontSize}px ${letterStyle.fontFamily} `;

            const width = this.context.measureText(letter).width;
            return previous + width;
          },
          0
        );
        const caretY = line * this.lineHeight;
        this.context.beginPath();
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.moveTo(caretX, caretY);
        this.context.lineTo(caretX, caretY + this.lineHeight);
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  public calculateBoundingBoxes(): void {
    this.context.textBaseline = "bottom";
    const { text, styles } = this.text.getText();
    const boundingBoxes: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[][] = [];

    let cursorY = this.lineHeight;
    for (let lineIndex = 0; lineIndex < text.length; lineIndex++) {
      const line = text[lineIndex];
      let cursorX = 0;

      boundingBoxes[lineIndex] = [];
      for (let i = 0; i < line.length; i++) {
        const letterStyle = getPreviousStyles(styles, {
          line: lineIndex,
          index: i,
        });

        const letter = getStyledLetter(line[i], letterStyle);

        this.context.font = `${letterStyle.fontStyle} ${letterStyle.fontWeight} ${letterStyle.fontSize}px ${letterStyle.fontFamily} `;
        const letterWidth = this.context.measureText(letter).width;

        const textMetrics = this.context.measureText(letter);
        const width = textMetrics.width;
        const height =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;

        boundingBoxes[lineIndex].push({
          x: cursorX,
          y: cursorY - textMetrics.actualBoundingBoxAscent,
          width,
          height,
        });

        cursorX += letterWidth;
      }
      cursorY += this.lineHeight;
    }
    this.boundingBoxes = boundingBoxes;
    this.updateListeners();
  }

  public writeText(): void {
    this.context.textBaseline = "bottom";
    const { text, styles } = this.text.getText();

    let cursorY = this.lineHeight;
    for (let lineIndex = 0; lineIndex < text.length; lineIndex++) {
      const line = text[lineIndex];
      let cursorX = 0;

      for (let i = 0; i < line.length; i++) {
        const letterStyle = getPreviousStyles(styles, {
          line: lineIndex,
          index: i,
        });

        const letter = getStyledLetter(line[i], letterStyle);

        this.context.font = `${letterStyle.fontStyle} ${letterStyle.fontWeight} ${letterStyle.fontSize}px ${letterStyle.fontFamily} `;
        this.context.fillStyle = letterStyle.color || "black";
        const letterWidth = this.context.measureText(letter).width;
        this.context.fillText(letter, cursorX, cursorY);

        cursorX += letterWidth;
      }
      cursorY += this.lineHeight;
    }
  }
}
