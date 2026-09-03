import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { AsyncSearchBox } from '@/core/async/AsyncSearchBox';
import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@/core/TextWithoutFormatting';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { useCustomer, useProject } from '@/workspace/hooks';

import { OfferingDetailsLink } from '../links/OfferingDetailsLink';
import { OfferingLink } from '../links/OfferingLink';

const OfferingListItem: FC<{ row: any }> = ({ row }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(row), [row]);

  return (
    <OfferingDetailsLink offering_uuid={row.uuid}>
      <div className="d-flex text-dark bg-hover-primary-50 align-items-center px-4 py-2">
        <div className="flex-shrink-0 me-4">
          {row.thumbnail ? (
            <Image src={row.thumbnail} size={24} circle />
          ) : (
            <div className="symbol">
              <ImagePlaceholder
                width="24px"
                height="24px"
                circle
                className="fs-8"
              >
                {abbreviation}
              </ImagePlaceholder>
            </div>
          )}
        </div>
        <div className="flex-grow-1 d-flex flex-column justify-content-start fw-semibold ellipsis">
          <span className="fs-4 fw-semibold ellipsis">{row.name}</span>
          <span className="fs-7 fw-semibold text-muted ellipsis">
            <TextWithoutFormatting html={truncate(row.description, 60)} />
          </span>
        </div>
        {!isFeatureVisible(MarketplaceFeatures.catalogue_only) && (
          <div className="flex-shrink-0">
            <Tip
              id={`search-offering-${row.uuid}`}
              label={translate('Add resource')}
            >
              <OfferingLink
                offering_uuid={row.uuid}
                buttonVariant="text-primary"
                className="btn-icon btn-sm"
              >
                <span className="svg-icon svg-icon-2">
                  <PlusCircleIcon weight="bold" />
                </span>
              </OfferingLink>
            </Tip>
          </div>
        )}
      </div>
    </OfferingDetailsLink>
  );
};

export const OfferingsSearchBox = () => {
  const customer = useCustomer();
  const project = useProject();

  const params = useMemo(() => {
    const field = [
      'uuid',
      'name',
      'description',
      'thumbnail',
      'customer_name',
      'customer_uuid',
      'state',
      'paused_reason',
    ] satisfies MarketplacePublicOfferingsListData['query']['field'];

    return {
      o: ['-created'],
      state: ['Active', 'Paused'],
      field,
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    } satisfies MarketplacePublicOfferingsListData['query'];
  }, [customer, project]);

  return (
    <AsyncSearchBox
      fetcher={marketplacePublicOfferingsList}
      queryKey="marketplace-public-offerings"
      queryField="keyword"
      params={params}
      RowComponent={OfferingListItem}
      placeholder={translate('Search offerings...')}
      emptyMessage={translate(
        'No offerings match your search. To find organisations, projects or resources, use the search in the top bar.',
      )}
      className="w-400px"
    />
  );
};
