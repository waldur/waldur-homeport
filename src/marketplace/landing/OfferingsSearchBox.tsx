import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AsyncSearchBox } from '@waldur/core/AsyncSearchBox';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@waldur/core/TextWithoutFormatting';
import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { OfferingDetailsLink } from '../links/OfferingDetailsLink';
import { OfferingLink } from '../links/OfferingLink';
import { Offering } from '../types';

const OfferingListItem: FC<{ row: Offering }> = ({ row }) => {
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
                className="btn btn-active-secondary btn-icon btn-icon-gray-700 btn-sm"
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
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

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
    ];

    return {
      o: '-created',
      state: ['Active', 'Paused'],
      field,
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    };
  }, [customer, project]);

  return (
    <AsyncSearchBox
      api="/marketplace-public-offerings/"
      queryField="keyword"
      params={params}
      RowComponent={OfferingListItem}
      emptyMessage={translate('There are no offerings.')}
      className="w-400px"
    />
  );
};
