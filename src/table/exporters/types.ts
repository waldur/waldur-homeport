export type ExportFormat = 'clipboard' | 'pdf' | 'excel' | 'csv';

export interface ExportConfig {
  format: ExportFormat;
  withFilters?: boolean;
  allPages?: boolean;
  /** Which columns the file holds: the ones on screen, or everything the
   * table's `fullExport` can write. */
  content?: 'visible' | 'full';
}

export interface ExportData {
  fields: (string | number)[];
  data: (string | number | boolean)[][];
}
