export class Canvelho {
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private currentText: string[] = ["Hello", "world!"];

  private caretPosition: { line: number; index: number } | null = null;
  private selectionRange: {
    start: { line: number; index: number };
    end: { line: number; index: number };
  } | null = null;
  private boundingBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[][] = [[]];
  private isMouseDown: boolean = false;
  private lineHeight: number = 60; // You can adjust this value as needed
  private textColor: string = "black"; // Default text color
  private startingPoint: { line: number; index: number } | null = null;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    if (!canvas) throw new Error("Canvas not found");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not found");
    this.context = context;

    this.bindEvents();

    this.writeText(this.currentText, 10, 50);
  }
  public changeTextColor(color: string): void {
    this.textColor = color;
    this.render(); // Re-render the canvas with the new text color
  }

  public render(): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.writeText(this.currentText, 10, 50);
    this.drawCaret(10, 50, 48);
    this.drawSelectionHighlight();
  }

  private handleCaretKeyActions(event: KeyboardEvent): void {
    const { line, index } = this.caretPosition!;
    const lineText = this.currentText[line];

    if (this.caretPosition !== null) {
      const { line, index } = this.caretPosition;
      const lineText = this.currentText[line];

      if (event.key === "ArrowLeft") {
        if (index > 0) {
          this.caretPosition = { line, index: index - 1 };
        } else if (line > 0) {
          const prevLineText = this.currentText[line - 1];
          this.caretPosition = {
            line: line - 1,
            index: prevLineText.length,
          };
        }
      } else if (event.key === "ArrowRight") {
        if (index < (lineText ? lineText.length : 0)) {
          this.caretPosition = { line, index: index + 1 };
        } else if (line < this.currentText.length - 1) {
          this.caretPosition = { line: line + 1, index: 0 };
        }
      } else if (event.key === "ArrowUp") {
        if (line > 0) {
          const prevLineText = this.currentText[line - 1];
          const newIndex = Math.min(index, prevLineText.length);
          this.caretPosition = { line: line - 1, index: newIndex };
        }
      } else if (event.key === "ArrowDown") {
        if (line < this.currentText.length - 1) {
          const nextLineText = this.currentText[line + 1];
          const newIndex = Math.min(index, nextLineText.length);
          this.caretPosition = { line: line + 1, index: newIndex };
        }
      } else if (event.key === "Delete") {
        if (index < lineText.length) {
          const textBeforeCaret = lineText.slice(0, index);
          const textAfterCaret = lineText.slice(index + 1);
          this.currentText[line] = textBeforeCaret + textAfterCaret;
          this.caretPosition = { line, index }; // Update caret position
        } else if (line < this.currentText.length - 1) {
          const textOnCurrentLine = lineText + this.currentText[line + 1];
          this.currentText.splice(line, 2, textOnCurrentLine);
          this.caretPosition = { line, index: lineText.length };
        }
      } else if (event.key === "Enter") {
        const textBeforeCaret = lineText.slice(0, index);
        const textAfterCaret = lineText.slice(index);
        this.currentText[line] = textBeforeCaret;
        this.currentText.splice(line + 1, 0, textAfterCaret);
        this.caretPosition = { line: line + 1, index: 0 };
        this.render();
      } else if (event.key === "Backspace") {
        if (index > 0) {
          const textBeforeCaret = lineText.slice(0, index - 1);
          const textAfterCaret = lineText.slice(index);
          this.currentText[line] = textBeforeCaret + textAfterCaret;
          this.caretPosition = { line, index: index - 1 };
        } else if (line > 0) {
          const prevLineText = this.currentText[line - 1];
          const combinedText = prevLineText + lineText;
          this.currentText.splice(line - 1, 2, combinedText);
          this.caretPosition = {
            line: line - 1,
            index: prevLineText.length,
          };
        }
      } else if (event.key.length === 1) {
        const newText =
          lineText.slice(0, index) + event.key + lineText.slice(index);
        this.currentText[line] = newText;
        this.caretPosition = { line, index: index + 1 };
      }
      this.render();
    }
  }

  private handleSelectionKeyActions(event: KeyboardEvent): void {
    const { start, end } = this.selectionRange!;

    if (event.key === "Escape") {
      // Clear selection and caret position if present
      this.selectionRange = null;
      this.render();
    } else if (event.key === "Enter") {
      // Replace selected text with a newline character and update caret position
      const newText =
        this.currentText[start.line].slice(0, start.index) +
        "\n" +
        this.currentText[end.line].slice(end.index);
      this.currentText.splice(start.line, end.line - start.line + 1, newText);

      const newCaretPosition = { line: start.line + 1, index: 0 };

      // Clear selection and update caret position
      this.selectionRange = null;
      this.caretPosition = newCaretPosition;

      this.render();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      // Handle deletion of selected text
      if (start.line === end.line) {
        const newText =
          this.currentText[start.line].slice(0, start.index) +
          this.currentText[end.line].slice(end.index);
        this.currentText[start.line] = newText;
        this.caretPosition = { line: start.line, index: start.index };
      } else {
        const newText =
          this.currentText[start.line].slice(0, start.index) +
          this.currentText[end.line].slice(end.index);
        this.currentText.splice(start.line, end.line - start.line + 1, newText);
        this.caretPosition = { line: start.line, index: start.index };
      }

      // Clear selection and update caret position
      this.selectionRange = null;

      this.render();
    } else if (event.key.length === 1) {
      // Replace selected text with typed character
      const newText =
        this.currentText[start.line].slice(0, start.index) +
        event.key +
        this.currentText[end.line].slice(end.index);
      this.currentText.splice(start.line, end.line - start.line + 1, newText);

      // Set caret position after inserted text
      const newCaretPosition = { line: start.line, index: start.index + 1 };

      // Clear selection and update caret position
      this.selectionRange = null;
      this.caretPosition = newCaretPosition;

      this.render();
    }
  }

  bindEvents(): void {
    this.canvas.addEventListener("keydown", (event) => {
      // Handle key actions based on whether there's a selection range
      if (this.selectionRange !== null) {
        this.handleSelectionKeyActions(event);
      } else if (this.caretPosition !== null) {
        this.handleCaretKeyActions(event);
      }
    });

    this.canvas.addEventListener("click", (event) => {
      if (event.detail === 3) {
        // Triple-click event
        const { offsetX, offsetY } = event;
        const clickedBoundingBox = this.findBoundingBoxAtPosition(
          offsetX,
          offsetY
        );

        if (clickedBoundingBox) {
          const { line, index } = clickedBoundingBox;
          const wordBounds = this.getWordBounds(line, index);

          if (wordBounds) {
            this.selectionRange = { ...wordBounds };
            this.caretPosition = { ...wordBounds.end };
            this.render();
          }
        }
      }
    });

    // Inside the 'mousedown' event listener
    this.canvas.addEventListener("mousedown", (event) => {
      const { offsetX, offsetY } = event;
      const clickedBoundingBox = this.findBoundingBoxAtPosition(
        offsetX,
        offsetY
      );

      this.isMouseDown = true;

      if (clickedBoundingBox) {
        const { line, index } = clickedBoundingBox;

        // Store the clicked position
        const clickedPosition =
          offsetX > this.getBoundingBoxCenterX(line, index)
            ? { line, index: index + 1 }
            : { line, index };
        this.startingPoint = clickedPosition;
        // Update selection range
        this.selectionRange = {
          start: clickedPosition,
          end: clickedPosition,
        };

        // Update caret position to be after the selection
        this.caretPosition = { ...clickedPosition };

        this.render();
      }
    });
    this.canvas.addEventListener("dblclick", (event) => {
      const { offsetX, offsetY } = event;
      const clickedBoundingBox = this.findBoundingBoxAtPosition(
        offsetX,
        offsetY
      );

      if (clickedBoundingBox) {
        const { line, index } = clickedBoundingBox;

        this.selectionRange = {
          start: { line, index },
          end: { line, index: index + 1 },
        };

        this.caretPosition = { line, index: index + 1 };
        this.render();
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (this.isMouseDown && this.selectionRange) {
        const { offsetX, offsetY } = event;
        const hoveredBoundingBox = this.findBoundingBoxAtPosition(
          offsetX,
          offsetY
        );

        if (hoveredBoundingBox) {
          const { line, index } = hoveredBoundingBox;

          // Store the clicked position
          const end =
            offsetX > this.getBoundingBoxCenterX(line, index)
              ? { line, index: index + 1 }
              : { line, index };

          const start = this.startingPoint || { line, index };

          const startLine = Math.min(start.line, end.line);
          const endLine = Math.max(start.line, end.line);
          let startIdx = start.line === startLine ? start.index : end.index;
          let endIdx = end.line === endLine ? end.index : start.index;

          if (startLine === endLine && startIdx > endIdx) {
            const temp = startIdx;
            startIdx = endIdx;
            endIdx = temp;
          }

          // Check if the clicked position is before the start

          // Update the selection range
          this.selectionRange.start = { line: startLine, index: startIdx };
          this.selectionRange.end = { line: endLine, index: endIdx };
          // Update caret position
          this.caretPosition = this.selectionRange.end;

          this.render();
        }
      }
    });

    // Inside the bindEvents() method
    this.canvas.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });
  }

  private getWordBounds(
    line: number,
    index: number
  ): {
    start: { line: number; index: number };
    end: { line: number; index: number };
  } | null {
    const lineText = this.currentText[line];
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
  }

  private getBoundingBoxCenterX(line: number, index: number): number {
    const letterBox = this.boundingBoxes[line][index];
    return letterBox.x + letterBox.width / 2;
  }

  private drawSelectionHighlight(): void {
    if (this.selectionRange) {
      const { start, end } = this.selectionRange;

      this.context.fillStyle = "rgba(0, 0, 255, 0.3)";

      // Loop through lines within the selection
      for (let line = start.line; line <= end.line; line++) {
        const lineText = this.currentText[line];
        if (this.boundingBoxes[line]) {
          const lineY =
            this.boundingBoxes[line][0]?.y ||
            0 - this.context.measureText(lineText).actualBoundingBoxAscent;

          // Calculate the start X position of the selection highlight
          const startX =
            line === start.line
              ? this.boundingBoxes[line][
                  start.index === lineText.length && lineText.length > 0
                    ? start.index - 1
                    : start.index
                ].x
              : this.boundingBoxes[line][0]?.x || 0;

          // Calculate the width of the selection highlight
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

  private findBoundingBoxAtPosition(
    x: number,
    y: number
  ): { line: number; index: number } | null {
    for (let i = 0; i < this.boundingBoxes.length; i++) {
      const box = this.boundingBoxes[i];
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
  }

  public writeText(text: string[], x: number, y: number): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.currentText = text;
    this.context.font = "48px serif";
    this.context.textBaseline = "top";

    const boundingBoxes: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[][] = [];

    for (let lineIndex = 0; lineIndex < text.length; lineIndex++) {
      const line = text[lineIndex];
      let cursorX = x;
      boundingBoxes[lineIndex] = [];

      for (let i = 0; i < line.length; i++) {
        const letter = line[i];
        const letterWidth = this.context.measureText(letter).width;
        this.context.fillStyle = this.textColor;

        this.context.fillText(letter, cursorX, y);

        const textMetrics = this.context.measureText(letter);
        const width = textMetrics.width;
        const height =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;

        boundingBoxes[lineIndex].push({
          x: cursorX,
          y: y - textMetrics.actualBoundingBoxAscent,
          width,
          height,
        });

        cursorX += letterWidth;
      }

      y += this.lineHeight; // Use the custom lineHeight property instead of adding ascent, descent, and spacing
    }
    this.boundingBoxes = boundingBoxes;
  }

  public drawCaret(x: number, y: number, height: number): void {
    if (this.caretPosition !== null) {
      const { line, index } = this.caretPosition;
      const lineText = this.currentText[line];

      if (lineText) {
        const textBeforeCaret = lineText.slice(0, index);
        const caretX = x + this.context.measureText(textBeforeCaret).width;
        const caretY = y + line * this.lineHeight; // Calculate Y position based on line number and lineHeight

        this.context.beginPath();
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.moveTo(caretX, caretY);
        this.context.lineTo(caretX, caretY + height);
        this.context.stroke();
        this.context.closePath();
      }
    }
  }
}
