import { InvoiceItem } from './types';

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

export const formatPeriod = ({ year, month }) =>
  `${year}-${month < 10 ? '0' : ''}${month}`;

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
