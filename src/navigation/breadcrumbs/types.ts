export interface BreadcrumbItem {
  action?(): void;
  state?: string;
  params?: Record<string, string>;
  label: string;
}
