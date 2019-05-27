import * as React from 'react';

import { getMessage } from './utils';

interface Props {
  query?: string;
  verboseName?: string;
}

const TablePlaceholder = ({ query, verboseName }: Props) => {
  const message = getMessage({ query, verboseName });
  return (<p>{message}</p>);
};

export default TablePlaceholder;
