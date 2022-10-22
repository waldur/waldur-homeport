export interface Tab {
  title: string;
  to?: string;
  params?: Object;
  children?: Tab[];
}
