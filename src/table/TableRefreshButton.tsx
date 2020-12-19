import { FunctionComponent } from 'react';

import { TranslateProps } from '@waldur/i18n/types';

interface Props extends TranslateProps {
  fetch: () => void;
}

export const TableRefreshButton: FunctionComponent<Props> = ({
  fetch,
  translate,
}) => (
  <a className="btn btn-default btn-sm" onClick={fetch}>
    <i className="fa fa-refresh" />
    &nbsp;{translate('Refresh')}
  </a>
);
