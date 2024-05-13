export interface Tab {
  title: string;
  to?: string;
  params?: Record<string, any>;
  children?: Tab[];
}
