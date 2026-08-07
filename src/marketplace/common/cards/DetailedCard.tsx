import { LockSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Tip } from '@/core/Tooltip';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';
import Placeholder from '@/images/logo_w.svg';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';
import { TagBadges } from '@/marketplace/tags/TagBadges';
import { wrapTooltip } from '@/table/ActionButton';

import { getOfferingImage } from '../getOfferingImage';
import { ViewOfferingButton } from '../ViewOfferingButton';

import { OfferingCardVariantProps } from './types';
import { useOfferingAccessibility } from './useOfferingAccessibility';

import './cards.scss';

export const DetailedCard: FC<OfferingCardVariantProps> = ({
  offering,
  className,
  onTagClick,
}) => {
  const {
    isRestricted,
    isAllowed,
    isInaccessible,
    isDisabled,
    tooltipMessage,
    disabledButtonTooltip,
  } = useOfferingAccessibility(offering);

  const image = getOfferingImage(offering);

  return wrapTooltip(
    tooltipMessage,
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-detailed', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <Card className="card-bordered h-100 overflow-hidden cursor-pointer border-hover-brand">
        {/* Image section */}
        <div className="h-120px d-flex flex-center border-bottom bg-light-primary">
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
              <Placeholder className="mh-120px" />
            </span>
          )}
        </div>

        <Card.Body className="p-5 d-flex flex-column">
          {/* Header with logo and title */}
          <div className="d-flex align-items-center gap-4 mb-4">
            {offering.thumbnail ? (
              <Image src={offering.thumbnail} size={48} isContain circle />
            ) : (
              <ImagePlaceholder width="48px" height="48px" circle>
                {getAbbreviation(offering.name, 3)}
              </ImagePlaceholder>
            )}
            <div className="overflow-hidden">
              <div className="fs-4 fw-bold ellipsis-lines-2">
                {offering.name}
              </div>
              <div className="text-muted small ellipsis">
                {!isRestricted
                  ? offering.customer_name
                  : [offering.customer_name, offering.project_name]
                      .filter(Boolean)
                      .join(' - ')}
              </div>
            </div>
          </div>

          {/* Description */}
          {offering.description ? (
            <p className="text-muted small ellipsis-lines-3 mb-4 flex-grow-1">
              {offering.description}
            </p>
          ) : (
            <div className="flex-grow-1" />
          )}

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {offering.category_title && (
              <Badge variant="default" outline className="fw-normal">
                {offering.category_title}
              </Badge>
            )}
            {isRestricted && (
              <Tip
                id={`tip-restricted-detailed-${offering.uuid}`}
                label={
                  offering.project_name
                    ? translate(
                        'Offering is restricted to {project} in {organization}',
                        {
                          project: offering.project_name,
                          organization: offering.customer_name,
                        },
                      )
                    : translate('Offering is restricted to {organization}', {
                        organization: offering.customer_name,
                      })
                }
              >
                <Badge
                  variant="purple"
                  leftIcon={<QuestionIcon size={12} weight="bold" />}
                  outline
                  className="fw-normal"
                >
                  {translate('Restricted')}
                </Badge>
              </Tip>
            )}
            {isInaccessible && (
              <Tip
                id={`tip-inaccessible-detailed-${offering.uuid}`}
                label={translate(
                  'This offering is not accessible to your organization',
                )}
              >
                <Badge
                  variant="default"
                  leftIcon={<LockSimpleIcon size={12} weight="bold" />}
                  outline
                  className="fw-normal"
                >
                  {translate('Inaccessible')}
                </Badge>
              </Tip>
            )}
            <TagBadges
              tags={offering.tags}
              maxTags={3}
              onTagClick={onTagClick}
            />
          </div>
        </Card.Body>

        {/* Footer */}
        <Card.Footer className="py-4 px-5 d-flex justify-content-end gap-2">
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
