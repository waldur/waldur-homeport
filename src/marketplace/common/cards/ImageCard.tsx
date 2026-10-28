import classNames from 'classnames';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { getAbbreviation } from '@/core/utils';
import Placeholder from '@/images/logo_w.svg';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';

import { getOfferingImage } from '../getOfferingImage';
import { ViewOfferingButton } from '../ViewOfferingButton';

import { OfferingCardVariantProps } from './types';
import { useOfferingAccessibility } from './useOfferingAccessibility';

import './cards.scss';

export const ImageCard: FC<OfferingCardVariantProps> = ({
  offering,
  className,
}) => {
  const { isAllowed, isDisabled, tooltipMessage, disabledButtonTooltip } =
    useOfferingAccessibility(offering);
  const image = getOfferingImage(offering);

  const card = (
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-image', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <div className="card card-bordered h-full overflow-hidden cursor-pointer border-hover-brand">
        {/* Image header */}
        <div className="image-card-header">
          {image ? (
            <img
              alt={offering.name}
              src={image}
              className="w-full h-full"
              style={{
                objectFit: offering.image ? 'cover' : 'contain',
                padding: offering.image ? 0 : '10px',
              }}
            />
          ) : (
            <Placeholder className="size-[75px] text-primary max-h-[70px]" />
          )}
        </div>

        {/* Content: avatar + title */}
        <div className="card-body p-3 flex items-center gap-2.5">
          {offering.thumbnail ? (
            <Image src={offering.thumbnail} size={48} isContain circle />
          ) : (
            <ImagePlaceholder width="48px" height="48px" circle>
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

        {/* Footer */}
        <div className="card-footer py-3 px-4 flex justify-end gap-3">
          <CardRequestAccessButton
            offering={offering}
            orderDisabledReason={isDisabled ? disabledButtonTooltip : undefined}
          />
          <ViewOfferingButton
            offering={offering}
            disabled={isDisabled}
            disabledReason={disabledButtonTooltip}
          />
        </div>
      </div>
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
