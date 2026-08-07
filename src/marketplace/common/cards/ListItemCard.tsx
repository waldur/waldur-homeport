import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { getAbbreviation } from '@/core/utils';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';
import { wrapTooltip } from '@/table/ActionButton';

import { ViewOfferingButton } from '../ViewOfferingButton';

import { OfferingCardVariantProps } from './types';
import { useOfferingAccessibility } from './useOfferingAccessibility';

import './cards.scss';

export const ListItemCard: FC<OfferingCardVariantProps> = ({
  offering,
  className,
}) => {
  const { isAllowed, isDisabled, tooltipMessage, disabledButtonTooltip } =
    useOfferingAccessibility(offering);

  return wrapTooltip(
    tooltipMessage,
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-list', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <Card className="card-bordered h-100 cursor-pointer border-hover-brand">
        <Card.Body className="p-4 d-flex gap-4">
          {/* Left content */}
          <div className="flex-grow-1 overflow-hidden">
            {/* Avatar + Title row */}
            <div className="d-flex align-items-center gap-3 mb-3">
              {offering.thumbnail ? (
                <Image
                  src={offering.thumbnail}
                  size={48}
                  isContain
                  circle
                  classes="flex-shrink-0"
                />
              ) : (
                <ImagePlaceholder
                  width="48px"
                  height="48px"
                  circle
                  minWidth="48px"
                >
                  {getAbbreviation(offering.name, 3)}
                </ImagePlaceholder>
              )}
              <div className="overflow-hidden">
                <div className="fw-semibold ellipsis" style={{ fontSize: 16 }}>
                  {offering.name}
                </div>
                <div className="text-muted ellipsis" style={{ fontSize: 14 }}>
                  {offering.customer_name}
                </div>
              </div>
            </div>

            {/* Description */}
            {offering.description && (
              <div
                className="text-muted ellipsis-lines-2"
                style={{ fontSize: 14 }}
              >
                {offering.description}
              </div>
            )}
          </div>

          {/* Right buttons column */}
          <div className="d-flex flex-column justify-content-center gap-4 flex-shrink-0 list-card-actions">
            <ViewOfferingButton
              offering={offering}
              disabled={isDisabled}
              disabledReason={disabledButtonTooltip}
            />
            <CardRequestAccessButton
              offering={offering}
              orderDisabledReason={
                isDisabled ? disabledButtonTooltip : undefined
              }
            />
          </div>
        </Card.Body>
      </Card>
    </OfferingDetailsLink>,
  );
};
