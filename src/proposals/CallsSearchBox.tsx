import { FC, useMemo } from 'react';

import { fixURL } from '@waldur/core/api';
import { AsyncSearchBox } from '@waldur/core/AsyncSearchBox';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

import { Call } from './types';

const CallListItem: FC<{ row: Call }> = ({ row }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(row), [row]);

  return (
    <Link state="public-calls.details" params={{ uuid: row.uuid }}>
      <div className="d-flex text-dark text-hover-primary align-items-center mb-5">
        <div className="symbol me-4">
          <ImagePlaceholder
            width="40px"
            height="40px"
            backgroundColor="#e2e2e2"
          >
            {abbreviation && (
              <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
            )}
          </ImagePlaceholder>
        </div>
        <div className="d-flex flex-column justify-content-start fw-semibold ellipsis">
          <span className="fs-6 fw-semibold ellipsis">{row.name}</span>
          <span className="fs-7 fw-semibold text-muted ellipsis">
            {row.customer_name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const CallsSearchBox = () => {
  return (
    <AsyncSearchBox
      api={fixURL('/proposal-public-calls/')}
      queryField="name"
      params={{ has_active_round: true }}
      RowComponent={CallListItem}
      placeholder={translate('Search for call by name or offering') + '...'}
      emptyMessage={translate(
        'There are no results for this keyword, please try another one',
      )}
      className="w-300px"
      wrapperClassName="mx-md-0 mx-auto"
    />
  );
};
