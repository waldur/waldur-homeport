import { FunctionComponent, ReactNode } from 'react';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { TableProps } from './types';
import { getNoResultMessage, getNoResultTitle } from './utils';

interface TablePlaceholderProps extends Pick<
  TableProps,
  'query' | 'verboseName' | 'fetch' | 'filtersStorage' | 'emptyMessage'
> {
  clearSearch(): void;
  actions?: ReactNode;
  hasRetry?: boolean;
}

export const TablePlaceholder: FunctionComponent<TablePlaceholderProps> = ({
  query,
  verboseName,
  emptyMessage,
  clearSearch,
  hasRetry = true,
  actions,
  fetch,
  filtersStorage,
}) => {
  const message = getNoResultMessage({
    query,
    verboseName,
    customEmpty: emptyMessage,
  });
  const title = getNoResultTitle({
    verboseName,
    hasFilter: filtersStorage?.length > 0,
  });

  return (
    <NoResult
      callback={!hasRetry ? null : query ? clearSearch : () => fetch(true)}
      title={title}
      message={
        filtersStorage?.length ? (
          <p className="mw-300px">
            {translate(
              'Please try again with different keywords or check your filters',
            )}
          </p>
        ) : (
          <span className="mw-350px">{message}</span>
        )
      }
      buttonTitle={
        query ? translate('Clear search') : translate('Search again')
      }
      actions={actions}
    />
  );
};
