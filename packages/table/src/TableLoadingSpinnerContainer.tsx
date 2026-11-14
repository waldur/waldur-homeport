import { SpinnerIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Sorting } from './types';

/** The table's own spinner, in the brand colour. */
export const TableSpinner = () => (
  <SpinnerIcon
    className="animation-spin text-brand"
    role="status"
    data-slot="spinner"
    weight="bold"
  />
);

interface TableLoadingSpinnerContainerProps {
  loading?: boolean;
  sorting?: Sorting & { loading?: boolean };
}

export const TableLoadingSpinnerContainer: FunctionComponent<
  TableLoadingSpinnerContainerProps
> = (props) =>
  // Show spinner when:
  // 1. loading is true (general loading state)
  // 2. sorting.loading is true (sorting in progress)
  // Mirrors TableRefreshButton.tsx's showSpinner logic. The previous
  // `props.loading && props.sorting && ...` form required `sorting` to be
  // truthy even for the plain-`loading` branch — this component's only real
  // call site (TableContent.tsx's initial-load spinner) never passes
  // `sorting` at all, so the spinner never rendered there; only the empty
  // `<h1 data-testid="table-content-loading">` wrapper did. The existing
  // test only asserts that wrapper's presence, not the spinner inside it,
  // which is why this went unnoticed.
  props.loading || (props.sorting && props.sorting.loading) ? (
    <TableSpinner />
  ) : null;
