import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

export const SearchBox: FunctionComponent<{
  value;
  onChange;
  placeholder;
  groupId;
  className?;
}> = ({ value, onChange, placeholder, groupId, className }) => (
  <div className={classNames('form-group', className)}>
    <div className="search-box-metro">
      <Form.Control
        id={groupId}
        size="sm"
        type="text"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="form-control-solid"
      />
      <label htmlFor={groupId}>
        <i className="fa fa-search" />
      </label>
    </div>
  </div>
);
