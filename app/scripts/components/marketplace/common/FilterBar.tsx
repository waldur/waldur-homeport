import * as React from 'react';

export const FilterBar = () => (
  <div className="input-group">
    <input type="text" className="form-control" placeholder="Search for apps and services..."/>
    <span className="input-group-btn">
      <button className="btn btn-primary">
        Search
      </button>
    </span>
  </div>
);
