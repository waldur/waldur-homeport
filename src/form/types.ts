export interface CustomComponentInputProps {
  name: string;
  value: string;
  onChange(name?: string): void;
}

export interface FilterOptions {
  name: string;
  choices: Array<{value: string; label: string}>;
  defaultValue: string;
}
