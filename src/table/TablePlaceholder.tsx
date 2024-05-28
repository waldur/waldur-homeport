import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { TableProps } from './Table';
import { getNoResultMessage, getNoResultTitle } from './utils';

interface TablePlaceholderProps
  extends Pick<
    TableProps,
    'query' | 'verboseName' | 'fetch' | 'filtersStorage'
  > {
  clearSearch(): void;
}

export const TablePlaceholder: FunctionComponent<TablePlaceholderProps> = ({
  query,
  verboseName,
  clearSearch,
  fetch,
  filtersStorage,
}) => {
  const message = getNoResultMessage({ query, verboseName });
  const title = getNoResultTitle({ verboseName });

  return (
    <NoResult
      callback={query ? clearSearch : fetch}
      title={title}
      message={
        <>
          {message}
          <br />
          {(query || filtersStorage?.length) && (
            <p className="mw-300px">
              {translate(
                'Please try again with different keywords or check your filters',
              )}
            </p>
          )}
        </>
      }
      buttonTitle={
        query ? translate('Clear search') : translate('Search again')
      }
    />
  );
};
