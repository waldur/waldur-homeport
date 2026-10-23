import { LockSimpleIcon, QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';
import Placeholder from '@/images/logo_w.svg';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { CardRequestAccessButton } from '@/marketplace/offerings/access/CardRequestAccessButton';
import { TagBadges } from '@/marketplace/tags/TagBadges';

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

  const card = (
    <OfferingDetailsLink
      offering_uuid={offering.uuid}
      className={classNames(className, 'offering-card-detailed', {
        disabled: isDisabled,
      })}
      disabled={!isAllowed}
    >
      <Card className="card-bordered h-full overflow-hidden cursor-pointer border-hover-brand">
        {/* Image section */}
        <div className="h-[120px] flex flex-center border-b-[1px] border-b-secondary bg-brand-subtle">
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
            <span className="svg-icon svg-icon-5tx svg-icon-dark">
              <Placeholder className="max-h-[120px]" />
            </span>
          )}
        </div>

        <Card.Body className="p-5 flex flex-col">
          {/* Header with logo and title */}
          <div className="flex items-center gap-4 mb-4">
            {offering.thumbnail ? (
              <Image src={offering.thumbnail} size={48} isContain circle />
            ) : (
              <ImagePlaceholder width="48px" height="48px" circle>
                {getAbbreviation(offering.name, 3)}
              </ImagePlaceholder>
            )}
            <div className="overflow-hidden">
              <div className="text-base font-medium ellipsis-lines-2">
                {offering.name}
              </div>
              <div className="text-quaternary small ellipsis">
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
            <p className="text-quaternary small ellipsis-lines-3 mb-4 grow">
              {offering.description}
            </p>
          ) : (
            <div className="grow" />
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {offering.category_title && (
              <Badge variant="neutral" tone="outline" className="font-normal">
                {offering.category_title}
              </Badge>
            )}
            {isRestricted && (
              <Tooltip
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
                  tone="outline"
                  className="font-normal"
                >
                  {translate('Restricted')}
                </Badge>
              </Tooltip>
            )}
            {isInaccessible && (
              <Tooltip
                label={translate(
                  'This offering is not accessible to your organization',
                )}
              >
                <Badge
                  variant="neutral"
                  leftIcon={<LockSimpleIcon size={12} weight="bold" />}
                  tone="outline"
                  className="font-normal"
                >
                  {translate('Inaccessible')}
                </Badge>
              </Tooltip>
            )}
            <TagBadges
              tags={offering.tags}
              maxTags={3}
              onTagClick={onTagClick}
            />
          </div>
        </Card.Body>

        {/* Footer */}
        <Card.Footer className="py-4 px-5 flex justify-end gap-2">
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
