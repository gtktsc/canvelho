export class Events {
  private canvas: HTMLCanvasElement;
  public onKeyDown?(event: KeyboardEvent): void;
  public onKeyUp?(event: KeyboardEvent): void;
  public onMouseDown?(event: MouseEvent): void;
  public onMouseUp?(event: MouseEvent): void;
  public onMouseMove?(event: MouseEvent): void;
  public onClick?(event: MouseEvent): void;
  public onDoubleClick?(event: MouseEvent): void;
  public onResize?(event: Event): void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
    this.setupEvents();
  }

  onDoubleClickCallback(event: MouseEvent): void {
    this.onDoubleClick?.(event);
    event.stopPropagation();
  }

  onResizeCallback(event: Event): void {
    this.onResize?.(event);
    event.stopPropagation();
  }

  onClickCallback(event: MouseEvent): void {
    this.onClick?.(event);
    event.stopPropagation();
  }

  onKeyDownCallback(event: KeyboardEvent): void {
    this.onKeyDown?.(event);
    event.stopPropagation();
  }

  onKeyUpCallback(event: KeyboardEvent): void {
    this.onKeyUp?.(event);
    event.stopPropagation();
  }

  onMouseDownCallback(event: MouseEvent): void {
    this.onMouseDown?.(event);
    event.stopPropagation();
  }
  onMouseUpCallback(event: MouseEvent): void {
    this.onMouseUp?.(event);
    event.stopPropagation();
  }
  onMouseMoveCallback(event: MouseEvent): void {
    this.onMouseMove?.(event);
    event.stopPropagation();
  }

  bindEvents(): void {
    this.onKeyDownCallback = this.onKeyDownCallback.bind(this);
    this.onKeyUpCallback = this.onKeyUpCallback.bind(this);
    this.onMouseDownCallback = this.onMouseDownCallback.bind(this);
    this.onMouseUpCallback = this.onMouseUpCallback.bind(this);
    this.onMouseMoveCallback = this.onMouseMoveCallback.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);
    this.onDoubleClickCallback = this.onDoubleClickCallback.bind(this);
    this.onResizeCallback = this.onResizeCallback.bind(this);
  }

  setupEvents() {
    if (typeof window === "undefined") return;

    this.canvas.addEventListener("keydown", this.onKeyDownCallback);
    this.canvas.addEventListener("keyup", this.onKeyUpCallback);
    this.canvas.addEventListener("mousedown", this.onMouseDownCallback);
    this.canvas.addEventListener("mouseup", this.onMouseUpCallback);
    this.canvas.addEventListener("mousemove", this.onMouseMoveCallback);
    this.canvas.addEventListener("click", this.onClickCallback);
    this.canvas.addEventListener("dblclick", this.onDoubleClickCallback);
    window.addEventListener("resize", this.onResizeCallback);
  }
  removeEvents() {
    this.canvas.removeEventListener("keydown", this.onKeyDownCallback);
    this.canvas.removeEventListener("keyup", this.onKeyUpCallback);
    this.canvas.removeEventListener("mousedown", this.onMouseDownCallback);
    this.canvas.removeEventListener("mouseup", this.onMouseUpCallback);
    this.canvas.removeEventListener("mousemove", this.onMouseMoveCallback);
    this.canvas.removeEventListener("click", this.onClickCallback);
    this.canvas.removeEventListener("dblclick", this.onDoubleClickCallback);
    window.removeEventListener("resize", this.onResizeCallback);
  }
}
