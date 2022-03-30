import { Form } from 'react-bootstrap';

export const RadioField = ({
  input: { value, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  groupName,
  ...props
}) => (
  <Form.Check
    type="radio"
    value={value}
    onChange={onChange}
    {...props}
    name={groupName}
  />
);
