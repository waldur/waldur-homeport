export interface Item {
  action?(): void;
  state?: string;
  params?: Record<string, string>;
  label: string;
}
