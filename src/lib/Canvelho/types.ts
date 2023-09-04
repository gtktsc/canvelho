export type Style = {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  underline?: string;
  fontWeight?: string;
  textTransform?: string;
  fontStyle?: string;
  textDecoration?: string;
  lineHeight?: number;
  textAlign?: string;
};

export type Position = { line: number; index: number };
export type Range = {
  start: Position;
  end: Position;
};

export type BoundingBoxes = {
  x: number;
  y: number;
  width: number;
  height: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
}[][];

export type Text = string[];
export type Styles = Style[][];
