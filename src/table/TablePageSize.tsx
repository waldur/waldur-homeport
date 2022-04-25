import { FunctionComponent } from 'react';

import { Pagination } from '@waldur/table/types';
import './TablePageSize.scss';

const PAGE_SIZES = [10, 25, 50, 100];

interface TablePageSizeProps extends Pagination {
  updatePageSize: (value: number) => void;
}

export const TablePageSize: FunctionComponent<TablePageSizeProps> = (props) => {
  if (props.resultCount <= 10) {
    return null;
  }
  return (
    <label>
      <select
        className="form-select form-select-sm form-select-solid"
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
    </label>
  );
};
