import { Select } from '@waldur/form/themed-select';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SelectField = ({ input: { value, onChange }, meta, ...props }) => (
  <Select value={value} onChange={onChange} {...props} />
);
