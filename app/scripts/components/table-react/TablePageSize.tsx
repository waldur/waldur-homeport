import * as React from 'react';
import Select from 'react-select';

import { TranslateProps } from '@waldur/i18n';

import './TablePageSize.scss';

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

interface TablePageSizeProps extends TranslateProps {
  pageSize: number;
  updatePageSize: (value: {}) => void;
}

export const TablePageSize = (props: TablePageSizeProps) => {
  const pageSize = props.pageSize ? props.pageSize : 10;
  return (
    <div className="table-page-size">
      <span className="text-wrapper m-r-sm">{props.translate('Show')}</span>
        <Select
          className="page-size-selector"
          name="numOfRows"
          value={pageSize}
          labelKey="name"
          valueKey="value"
          options={options}
          clearable={false}
          onChange={value => props.updatePageSize(value)}
        />
      <span className="text-wrapper m-l-sm">{props.translate('entries')}</span>
    </div>
  );
};
