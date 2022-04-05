import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import './FilterGroup.scss';

export const FilterGroup: FunctionComponent<{
  value;
  onChange;
  placeholder;
  groupId;
}> = ({ value, onChange, placeholder, groupId }) => (
  <Form.Group>
    <div className="search-box">
      <Form.Control
        id={groupId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <label htmlFor={groupId}>
        <i className="fa fa-search" />
      </label>
    </div>
  </Form.Group>
);
