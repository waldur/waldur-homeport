import classNames from 'classnames';
import { FunctionComponent } from 'react';

export const SearchBox: FunctionComponent<{
  value;
  onChange;
  placeholder;
  groupId;
  className?;
}> = ({ value, onChange, placeholder, groupId, className }) => (
  <div className={classNames('form-group', className)}>
    <div className="search-box-metro">
      <input
        id={groupId}
        type="text"
        className="form-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <label htmlFor={groupId}>
        <i className="fa fa-search" />
        {/* <span className="placeholder">{placeholder}</span> */}
      </label>
    </div>
  </div>
);
