export interface CustomComponentInputProps<T> {
  name: string;
  value: T;
  onChange(value?: T): void;
}

export interface FilterOptions {
  name: string;
  choices: Array<{value: string; label: string}>;
  defaultValue: string;
}
