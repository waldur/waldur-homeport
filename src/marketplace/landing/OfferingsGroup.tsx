import { FC } from 'react';
import { marketplacePublicOfferingsList, NestedTag } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingCard } from '../common/OfferingCard';

import { useCardStyle } from './CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  getOfferingGridSize,
  useOfferingListFilter,
} from './utils';

interface OfferingsGroupProps {
  onTagClick?(tag: NestedTag): void;
}

export const OfferingsGroup: FC<OfferingsGroupProps> = ({ onTagClick }) => {
  const cardStyle = useCardStyle();
  const filter = useOfferingListFilter(6);
  const tableProps = useTable({
    table: 'marketplace-landing-offerings',
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: UI_STALE_TIME,
    mandatoryFields: OFFERING_CARD_MANDATORY_FIELDS,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => (
        <OfferingCard
          offering={row}
          variant={cardStyle}
          onTagClick={onTagClick}
        />
      )}
      gridSize={getOfferingGridSize(cardStyle)}
      hoverShadow={{ grid: false }}
      mode="grid"
      title={translate('Latest offerings')}
      verboseName={translate('Offerings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      tableActions={
        <Link state="public.offerings" className="btn btn-tertiary">
          {translate('All offerings')}
        </Link>
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
