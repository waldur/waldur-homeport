import { FunctionComponent } from 'react';

import { getMessage } from './utils';

interface TablePlaceholderProps {
  query?: string;
  verboseName?: string;
}

export const TablePlaceholder: FunctionComponent<TablePlaceholderProps> = ({
  query,
  verboseName,
}) => {
  const message = getMessage({ query, verboseName });
  return <p style={{ textAlign: 'center', marginTop: '20px' }}>{message}</p>;
};
