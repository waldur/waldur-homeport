import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Tip } from '@/core/Tooltip';
import { getAbbreviation } from '@/core/utils';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { TagBadges } from '@/marketplace/tags/TagBadges';
import { wrapTooltip } from '@/table/ActionButton';

import { OfferingCardVariantProps } from './types';
import { useOfferingAccessibility } from './useOfferingAccessibility';

import './cards.scss';

export const CompactCard: FC<OfferingCardVariantProps> = ({
  offering,
  className,
}) => {
  const { isAllowed, isDisabled, tooltipMessage } =
    useOfferingAccessibility(offering);

  const tooltipContent = (
    <div>
      <strong>{offering.name}</strong>
      <div className="text-muted small">{offering.customer_name}</div>
      {offering.description && (
        <div className="mt-2 small">{offering.description}</div>
      )}
      {offering.tags?.length > 0 && (
        <div className="mt-2">
          <TagBadges tags={offering.tags} />
        </div>
      )}
    </div>
  );

  return wrapTooltip(
    tooltipMessage,
    <Tip id={`compact-card-${offering.uuid}`} label={tooltipContent}>
      <OfferingDetailsLink
        offering_uuid={offering.uuid}
        className={classNames(className, 'offering-card-compact', {
          disabled: isDisabled,
        })}
        disabled={!isAllowed}
      >
        <Card className="card-bordered h-100 cursor-pointer border-hover-brand">
          <Card.Body className="p-4 d-flex align-items-center gap-3">
            {offering.thumbnail ? (
              <Image src={offering.thumbnail} size={48} isContain circle />
            ) : (
              <ImagePlaceholder width="48px" height="48px" circle>
                {getAbbreviation(offering.name, 2)}
              </ImagePlaceholder>
            )}
            <div className="flex-grow-1 overflow-hidden">
              <div className="fw-semibold ellipsis" style={{ fontSize: 16 }}>
                {offering.name}
              </div>
              <div className="text-muted ellipsis" style={{ fontSize: 14 }}>
                {offering.customer_name}
              </div>
            </div>
            <div className="compact-card-hover-action">
              <CompactSubmitButton
                submitting={false}
                type="button"
                variant="text-primary"
                label={translate('View')}
              />
            </div>
          </Card.Body>
        </Card>
      </OfferingDetailsLink>
    </Tip>,
  );
};
