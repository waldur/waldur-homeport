export interface ListFieldParameters {
  formFieldName: string;
  label: string;
  configuration: ListConfiguration;
}

export interface ListConfiguration {
  columns: ListColumn[];
  choices: any[];
  attributeToShow: string;
}

export interface ListColumn {
  name: string;
  label: string;
}
