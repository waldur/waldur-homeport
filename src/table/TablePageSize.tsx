import * as React from 'react';
import Select from 'react-select';

import { translate } from '@waldur/i18n';

import './TablePageSize.scss';

const options = [10, 25, 50, 100].map((v) => ({
  label: v.toString(),
  value: v,
}));

interface TablePageSizeProps {
  pageSize: number;
  updatePageSize: (value: {}) => void;
}

export const TablePageSize = (props: TablePageSizeProps) => {
  const pageSize = props.pageSize ? props.pageSize : 10;
  return (
    <div>
      <span className="m-r-sm">{translate('Show')}</span>
      <Select
        className="table-page-size"
        value={{
          label: pageSize.toString(),
          value: pageSize,
        }}
        options={options}
        isClearable={false}
        onChange={(value) => props.updatePageSize(value)}
      />
      <span className="m-l-sm">{translate('entries')}</span>
    </div>
  );
};
