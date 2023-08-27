// Canvelho.ts

export class Canvelho {
  private context: CanvasRenderingContext2D;
  private currentText: string = "";

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  public render(): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
  }

  public highlightBoundingBox(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.context.beginPath();
    this.context.strokeStyle = "red";
    this.context.lineWidth = 2;
    this.context.rect(x, y, width, height);
    this.context.stroke();
    this.context.closePath();
  }

  public writeText(
    text: string,
    x: number,
    y: number
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  }[] {
    this.currentText = text;
    this.context.font = "48px serif";
    let cursorX = x;

    const boundingBoxes: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    for (let i = 0; i < this.currentText.length; i++) {
      const letter = this.currentText[i];
      const letterWidth = this.context.measureText(letter).width;
      this.context.fillText(letter, cursorX, y);

      const textMetrics = this.context.measureText(letter);
      const width = textMetrics.width;
      const height =
        textMetrics.actualBoundingBoxAscent +
        textMetrics.actualBoundingBoxDescent;

      boundingBoxes.push({
        x: cursorX,
        y: y - textMetrics.actualBoundingBoxAscent,
        width,
        height,
      });

      cursorX += letterWidth;
    }

    return boundingBoxes;
  }
}
