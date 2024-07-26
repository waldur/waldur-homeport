import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Pagination } from '@waldur/table/types';
import './TablePageSize.scss';

const PAGE_SIZES = [5, 10, 25, 50, 100];

interface TablePageSizeProps extends Pagination {
  updatePageSize: (value: number) => void;
}

export const TablePageSize: FunctionComponent<TablePageSizeProps> = (props) => {
  if (props.resultCount <= 5) {
    return null;
  }
  return (
    <div className="d-flex align-items-center">
      <label className="text-grey-500 text-nowrap">
        {translate('Rows per page')}:
      </label>
      <select
        className="form-select form-select-sm form-select-transparent ps-2 pe-9"
        onChange={(event) => {
          props.updatePageSize(parseInt(event.target.value, 10));
        }}
        value={props.pageSize}
      >
        {PAGE_SIZES.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
