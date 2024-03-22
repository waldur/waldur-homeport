import { LoadingSpinner } from '@waldur/table/TableRefreshButton';

interface RefreshButtonProps {
  refetch;
  loading?: boolean;
}

export const RefreshButton = (props: RefreshButtonProps) =>
  props.loading ? (
    <LoadingSpinner />
  ) : (
    <button
      type="button"
      className="btn btn-icon btn-active-light"
      onClick={props.refetch}
    >
      <i className="fa fa-refresh fs-4"></i>
    </button>
  );
