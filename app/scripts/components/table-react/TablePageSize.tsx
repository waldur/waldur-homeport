import * as React from 'react';
import Select from 'react-select';

const options = [
  {
    name: 10,
    value: 10,
  },
  {
    name: 25,
    value: 25,
  },
  {
    name: 50,
    value: 50,
  },
  {
    name: 100,
    value: 100,
  },
];

const TablePageSize = props => {
  const pageSize = props.pagination ? props.pagination.pageSize : 10;
  return (
    <>
      <span className="m-r-sm">Show</span>
      <div id="row-manager">
        <Select
          className="page-size-selector"
          name="numOfRows"
          value={pageSize}
          labelKey="name"
          valueKey="value"
          options={options}
          onChange={value => {
            if (value) {
              props.updatePageSize(value);
            }
          }}
          multi={false}/>
      </div>
      <span className="m-l-sm">entries</span>
    </>
  );
};

export default TablePageSize;
