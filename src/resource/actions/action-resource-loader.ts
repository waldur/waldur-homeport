import { getAll } from '@waldur/core/api';
import { $filter, $q } from '@waldur/core/services';

interface LegacyActionField {
  valueFormatter(option: any): any;
  formatter($filter: any, option: any): any;
  value_field: string;
  display_name_field: string;
  url?: string;
  emptyLabel: boolean;
  required?: boolean;
  choices: { value: any; display_name: string }[];
  rawChoices: any[];
}

const valueFormatter = (field: LegacyActionField, item) => {
  if (field.valueFormatter) {
    return field.valueFormatter(item);
  } else {
    return item[field.value_field];
  }
};

const displayFormatter = (field: LegacyActionField, item) => {
  if (field.formatter) {
    return field.formatter($filter, item);
  } else {
    return item[field.display_name_field];
  }
};

export const formatChoices = (field: LegacyActionField, items) => {
  return items.map((item) => ({
    value: valueFormatter(field, item),
    display_name: displayFormatter(field, item),
  }));
};

const loadChoices = (field: LegacyActionField) => {
  return getAll(field.url).then((items) => {
    const choices = formatChoices(field, items);
    if (field.emptyLabel && !field.required) {
      choices.unshift({
        display_name: field.emptyLabel,
      });
    }
    field.choices = choices;
    field.rawChoices = items;
  });
};

export const getSelectList = (fields: Record<string, LegacyActionField>) => {
  return $q.all(
    Object.keys(fields)
      .filter((key) => fields[key].url)
      .map((key) => loadChoices(fields[key])),
  );
};
