import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { getAbbreviation } from '@/core/utils';
import Placeholder from '@/images/logo_w.svg';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';
import { wrapTooltip } from '@/table/ActionButton';

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

  return wrapTooltip(
    tooltipMessage,
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-image', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <Card className="card-bordered h-100 overflow-hidden cursor-pointer border-hover-brand">
        {/* Image header */}
        <div className="image-card-header">
          {image ? (
            <img
              alt={offering.name}
              src={image}
              className="w-100 h-100"
              style={{
                objectFit: offering.image ? 'cover' : 'contain',
                padding: offering.image ? 0 : '10px',
              }}
            />
          ) : (
            <span className="svg-icon svg-icon-5tx svg-icon-dark">
              <Placeholder className="mh-70px" />
            </span>
          )}
        </div>

        {/* Content: avatar + title */}
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          {offering.thumbnail ? (
            <Image src={offering.thumbnail} size={48} isContain circle />
          ) : (
            <ImagePlaceholder width="48px" height="48px" circle>
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
        </Card.Body>

        {/* Footer */}
        <Card.Footer className="py-4 px-5 d-flex justify-content-end gap-4">
          <CardRequestAccessButton
            offering={offering}
            orderDisabledReason={isDisabled ? disabledButtonTooltip : undefined}
          />
          <ViewOfferingButton
            offering={offering}
            disabled={isDisabled}
            disabledReason={disabledButtonTooltip}
          />
        </Card.Footer>
      </Card>
    </OfferingDetailsLink>,
  );
};
