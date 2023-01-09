export const OrderNameColumn = ({ row }) =>
  row.items
    .map((item) => item.attributes.name)
    .filter((name) => name)
    .join(', ');
