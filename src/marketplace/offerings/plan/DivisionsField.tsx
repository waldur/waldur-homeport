import { Division } from '@waldur/marketplace/types';

export const DivisionsField = (fieldProps) => {
  const divisions = fieldProps.fields.getAll();
  const divisionsName = divisions.reduce(
    (a: Division, b: Division) => a.name + ', ' + b.name,
  );
  return <div className="form-control-static">{divisionsName}</div>;
};
