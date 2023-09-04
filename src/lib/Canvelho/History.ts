import { Styles } from "./types";

export class History {
  private state: { text: string; styles: string }[] = [];
  private pointer: number = 0;

  constructor(text: string[], styles: Styles) {
    this.state.push({
      text: JSON.stringify(text),
      styles: JSON.stringify(styles),
    });
  }

  public add({ text, styles }: { text: string[]; styles: Styles }) {
    if (
      JSON.stringify(text) !== this.state[this.pointer].text ||
      JSON.stringify(styles) !== this.state[this.pointer].styles
    ) {
      this.state.push({
        text: JSON.stringify(text),
        styles: JSON.stringify(styles),
      });
      this.pointer = this.state.length - 1;
    }
  }

  public undo() {
    this.pointer = Math.max(this.pointer - 1, 0);
    const { styles, text } = this.state[this.pointer];
    return { styles: JSON.parse(styles), text: JSON.parse(text) };
  }

  public redo() {
    this.pointer = Math.min(this.pointer + 1, this.state.length - 1);
    const { styles, text } = this.state[this.pointer];
    return { styles: JSON.parse(styles), text: JSON.parse(text) };
  }
}
