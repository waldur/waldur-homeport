import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FilterBox } from '@waldur/form/FilterBox';

export const FilterGroup: FunctionComponent<{
  value;
  onChange;
  placeholder;
  groupId;
}> = ({ value, onChange, placeholder, groupId }) => (
  <Form.Group className="mb-3 mt-6">
    <FilterBox
      id={groupId}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  </Form.Group>
);
