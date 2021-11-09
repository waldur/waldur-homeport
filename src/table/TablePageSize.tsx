import { FunctionComponent } from 'react';
import Select from 'react-select';

import { translate } from '@waldur/i18n';
import { Pagination } from '@waldur/table/types';
import './TablePageSize.scss';

const options = [10, 25, 50, 100].map((v) => ({
  label: v.toString(),
  value: v,
}));

interface TablePageSizeProps extends Pagination {
  updatePageSize: (value: {}) => void;
}

export const TablePageSize: FunctionComponent<TablePageSizeProps> = (props) => {
  const pageSize = props.pageSize ? props.pageSize : 10;
  return props.resultCount > 10 ? (
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
  ) : null;
};
