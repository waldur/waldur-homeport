import { FunctionComponent } from 'react';

import { SharedButton } from '@waldur/marketplace/offerings/service-providers/shared/Button';

interface GridRefreshButtonProps {
  fetch: () => void;
}

const RefreshIcon = require('./refresh.svg');

export const GridRefreshButton: FunctionComponent<GridRefreshButtonProps> = ({
  fetch,
}) => <SharedButton label="Refresh" onClick={fetch} iconPrefix={RefreshIcon} />;
