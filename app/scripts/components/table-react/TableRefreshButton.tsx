import * as React from 'react';

import { TranslateProps } from '@waldur/i18n/types';

interface Props extends TranslateProps {
  fetch: () => void;
}

const TableRefreshButton = ({ fetch, translate }: Props) => (
  <a className="btn btn-default btn-sm" onClick={fetch}>
    <i className="fa fa-refresh"/>
    &nbsp;{translate('Refresh')}
  </a>
);

export default TableRefreshButton;
