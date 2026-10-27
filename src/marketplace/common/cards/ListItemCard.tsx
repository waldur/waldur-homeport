import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { getAbbreviation } from '@/core/utils';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';

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

  const card = (
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-list', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <Card className="card-bordered h-full cursor-pointer border-hover-brand">
        <Card.Body className="p-3 flex gap-3">
          {/* Left content */}
          <div className="grow overflow-hidden">
            {/* Avatar + Title row */}
            <div className="flex items-center gap-2.5 mb-2.5">
              {offering.thumbnail ? (
                <Image
                  src={offering.thumbnail}
                  size={48}
                  isContain
                  circle
                  classes="shrink-0"
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
                <div className="ellipsis text-base">{offering.name}</div>
                <div className="text-quaternary ellipsis text-sm">
                  {offering.customer_name}
                </div>
              </div>
            </div>

            {/* Description */}
            {offering.description && (
              <div className="text-quaternary ellipsis-lines-2 text-sm">
                {offering.description}
              </div>
            )}
          </div>

          {/* Right buttons column */}
          <div className="flex flex-col justify-center gap-3 shrink-0 list-card-actions">
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
    </OfferingDetailsLink>
  );

  return tooltipMessage ? (
    <Tooltip label={tooltipMessage}>
      <span>{card}</span>
    </Tooltip>
  ) : (
    card
  );
};
