import * as React from 'react';

export const FilterGroup = ({ value, onChange, placeholder, groupId }) => (
  <div className="form-group">
    <div className="search-box">
      <input
        id={groupId}
        type="text"
        className="form-control"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <label htmlFor={groupId}>
        <i className="fa fa-search" />
      </label>
    </div>
  </div>
);
