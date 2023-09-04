import { defaultStyles } from "./constants";
import { Position, Range, Styles, Text as TextType } from "./types";
import { getPreviousStyles } from "./utils";

export class Text {
  private text: TextType;
  private styles: Styles = [[]];
  constructor(text: string[]) {
    this.text = text;
    this.generateStylesMap();
  }

  public getText() {
    return { text: this.text, styles: this.styles };
  }

  public setText(text: string[]) {
    this.text = text;
  }

  private generateStylesMap() {
    this.styles = new Array(this.text.length)
      .fill([])
      .map((_, i) => new Array(this.text[i].length).fill(defaultStyles));
  }

  public insertText(text: string, position: { line: number; index: number }) {
    const { line, index } = position;
    const currentLine = this.text[line];
    this.text[line] =
      currentLine.slice(0, index) + text + currentLine.slice(index);

    const previousStyles = getPreviousStyles(this.styles, {
      line,
      index,
    });

    this.styles[line].splice(index, 0, previousStyles);
  }

  private forAllInRange(
    range: Range,
    callback: (position: Position, iterator: number) => void
  ) {
    if (range) {
      const { start, end } = range;
      for (let line = end.line; line >= start.line; line--) {
        const currentLine = this.text[line];

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
        for (
          let index = Math.max(lineLength - 1, 1);
          index >= startIndex;
          index--
        ) {
          callback({ line, index }, iterator);
          iterator++;
        }
      }
    }
  }

  public removeLine(position: Position) {
    const { line } = position;
    this.text.splice(line, 1);
    this.styles.splice(line, 1);
  }

  public removeText(position: Position | Range | null) {
    if (!position) return;
    if ("start" in position) {
      const linesToRemove: Position[] = [];
      this.forAllInRange(position, ({ line, index }) => {
        // if line is empty - remove it
        if (
          index === 0 &&
          (this.text[line].length === 1 || this.text[line].length === 0) &&
          line !== 0
        ) {
          linesToRemove.unshift({ line, index });
        }
        this.removeText({ line, index: index + 1 });
      });
      for (let i = linesToRemove.length - 1; i >= 0; i--) {
        this.removeLine(linesToRemove[i]);
      }
    } else {
      const { line, index } = position;
      const currentLine = this.text[line];
      const currentStylesLine = this.styles[line];
      if (index === 0) {
        if (line === 0) {
          return;
        } else {
          const previousLine = this.text[line - 1];
          const previousStylesLine = this.styles[line - 1];

          this.text[line - 1] = previousLine + currentLine;
          this.styles[line - 1] = [...previousStylesLine, ...currentStylesLine];
          this.removeLine(position);
        }
      } else {
        const textBeforeCaret = currentLine.slice(0, index - 1);
        const stylesBeforeCaret = currentStylesLine.slice(0, index - 1);
        const textAfterCaret = currentLine.slice(index);
        const stylesAfterCaret = currentStylesLine.slice(index);
        this.text[line] = textBeforeCaret + textAfterCaret;
        this.styles[line] = [...stylesBeforeCaret, ...stylesAfterCaret];
      }
    }
  }

  public insertNewLine(position: { line: number; index: number }) {
    const { line, index } = position;
    const currentLine = this.text[line];
    const currentStyles = this.styles[line];

    const styleBeforeCaret = currentStyles.slice(0, index);
    const styleAfterCaret = currentStyles.slice(index);
    const textBeforeCaret = currentLine.slice(0, index);
    let textAfterCaret = currentLine.slice(index);

    if (textAfterCaret.length === 0) {
      // empty line, it has to be an array, because we are using splice
      // @ts-expect-error
      textAfterCaret = new Array(0);
    }

    this.text[line] = textBeforeCaret;
    this.styles[line] = styleBeforeCaret;

    this.styles.splice(line + 1, 0, styleAfterCaret);
    this.text.splice(line + 1, 0, textAfterCaret);
  }
}
