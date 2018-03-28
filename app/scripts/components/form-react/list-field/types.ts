export interface ListFieldParameters {
  formFieldName: string;
  label: string;
  configuration: ListConfiguration;
  description?: string;
}

export interface ListConfiguration {
  columns: ListColumn[];
  choices: any[];

  selectedValueToShow(selectedValue: any): string;
}

export interface ListColumn {
  name(row: any): string;
  label: string;
}
