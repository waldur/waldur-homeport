import { Pagination } from 'react-bootstrap';
import {
  createUltimatePagination,
  ITEM_TYPES,
} from 'react-ultimate-pagination';

export default createUltimatePagination({
  WrapperComponent: Pagination,
  itemTypeToComponent: {
    [ITEM_TYPES.PAGE]: ({ value, isActive, onClick }) => (
      <Pagination.Item active={isActive} onClick={onClick}>
        {value}
      </Pagination.Item>
    ),
    [ITEM_TYPES.ELLIPSIS]: ({ isActive, onClick }) => (
      <Pagination.Ellipsis disabled={isActive} onClick={onClick} />
    ),
    [ITEM_TYPES.FIRST_PAGE_LINK]: ({ isActive, onClick }) => (
      <Pagination.First disabled={isActive} onClick={onClick} />
    ),
    [ITEM_TYPES.PREVIOUS_PAGE_LINK]: ({ isActive, onClick }) => (
      <Pagination.Prev disabled={isActive} onClick={onClick} />
    ),
    [ITEM_TYPES.NEXT_PAGE_LINK]: ({ isActive, onClick }) => (
      <Pagination.Next disabled={isActive} onClick={onClick} />
    ),
    [ITEM_TYPES.LAST_PAGE_LINK]: ({ isActive, onClick }) => (
      <Pagination.Last disabled={isActive} onClick={onClick} />
    ),
  },
});
