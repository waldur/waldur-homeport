import { InvoiceItem } from '../types';

export function getItemName(item: InvoiceItem) {
  if (item.details) {
    // eslint-disable-next-line no-unused-vars
    const {
      offering_name,
      offering_type,
      plan_name,
      offering_component_name,
    } = item.details;
    if (
      offering_name &&
      offering_type &&
      plan_name &&
      offering_component_name
    ) {
      return `${offering_name} - ${offering_component_name} - (${offering_type} / ${plan_name})`;
    }
  }
  return item.name;
}

const groupInvoiceSubItems = (items: InvoiceItem[], projects) => {
  items.forEach(item => {
    if (!item.project_uuid) {
      projects.default.items.push(item);
    } else {
      if (!projects[item.project_uuid]) {
        projects[item.project_uuid] = {
          items: [],
          name: item.project_name,
        };
      }
      projects[item.project_uuid].items.push(item);
    }
  });
};

export const groupInvoiceItems = (items: InvoiceItem[]) => {
  const projects = {
    default: {
      items: [],
      name: '',
    },
  };
  groupInvoiceSubItems(items, projects);
  return Object.keys(projects)
    .map(key => projects[key])
    .sort((a, b) => a.name.localeCompare(b.name));
};

// phone numbers specification https://www.itu.int/rec/T-REC-E.164-201011-I
export function formatPhone(value) {
  if (
    value === undefined ||
    value.national_number === undefined ||
    value.country_code === undefined
  ) {
    return value;
  }

  let nationalNumber = value.national_number || '';

  if (nationalNumber.length === 7) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{2})(\d{2})/,
      '$1-$2-$3',
    );
  } else if (nationalNumber.length === 10) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3',
    );
  }

  return `(+${value.country_code})-${nationalNumber}`;
}
