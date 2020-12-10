import { FormControl } from 'react-bootstrap';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const InputField = ({ input, meta, ...props }) => (
  <FormControl {...input} {...props} />
);
