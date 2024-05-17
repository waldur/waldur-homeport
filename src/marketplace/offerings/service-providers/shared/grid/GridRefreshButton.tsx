import { FunctionComponent } from 'react';

import { SharedButton } from '@waldur/marketplace/offerings/service-providers/shared/Button';

import RefreshIcon from './refresh.svg';
interface GridRefreshButtonProps {
  fetch: () => void;
}

export const GridRefreshButton: FunctionComponent<GridRefreshButtonProps> = ({
  fetch,
}) => <SharedButton label="Refresh" onClick={fetch} iconPrefix={RefreshIcon} />;
