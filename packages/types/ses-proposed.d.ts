interface SourceLocation {
  readonly uri: string;
  readonly byte: number;
  readonly line: number;
  readonly column: number;
}
interface TemplateStringsArray extends ReadonlyArray<string> {
  readonly sources?: ReadonlyArray<SourceLocation>;
}
