import * as React from 'react';
import { TranslateProps } from './types';

type Props = TranslateProps & {
  fetch: () => void,
};

const TableRefreshButton = ({ fetch, translate }: Props) => (
  <a className='btn btn-default btn-sm' onClick={fetch}>
    <i className='fa fa-refresh'/>
    &nbsp;{translate('Refresh')}
  </a>
);

export default TableRefreshButton;
