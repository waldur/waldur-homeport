import classNames from 'classnames';
import { FC } from 'react';

import { BaseButton, Tooltip, Card, CardContent } from 'waldur-ui';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { htmlToPlainText } from '@/core/sanitize';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { TagBadges } from '@/marketplace/tags/TagBadges';

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
      <div className="text-quaternary small">{offering.customer_name}</div>
      {offering.description && (
        <div className="mt-1.5 small">
          {htmlToPlainText(offering.description)}
        </div>
      )}
      {offering.tags?.length > 0 && (
        <div className="mt-1.5">
          <TagBadges tags={offering.tags} />
        </div>
      )}
    </div>
  );

  const card = (
    <Tooltip label={tooltipContent}>
      <span>
        <OfferingDetailsLink
          offering_uuid={offering.uuid}
          className={classNames(className, 'offering-card-compact', {
            disabled: isDisabled,
          })}
          disabled={!isAllowed}
        >
          <Card bordered className="h-full cursor-pointer hover:border-brand">
            <CardContent className="p-3 flex items-center gap-2.5">
              {offering.thumbnail ? (
                <Image src={offering.thumbnail} size={48} isContain circle />
              ) : (
                <ImagePlaceholder width="48px" height="48px" circle>
                  {getAbbreviation(offering.name, 2)}
                </ImagePlaceholder>
              )}
              <div className="grow overflow-hidden">
                <div className="ellipsis text-base">{offering.name}</div>
                <div className="text-quaternary ellipsis text-sm">
                  {offering.customer_name}
                </div>
              </div>
              <div className="compact-card-hover-action">
                <BaseButton
                  size="sm"
                  variant="text-primary"
                  label={translate('View')}
                />
              </div>
            </CardContent>
          </Card>
        </OfferingDetailsLink>
      </span>
    </Tooltip>
  );

  return tooltipMessage ? (
    <Tooltip label={tooltipMessage}>
      <span>{card}</span>
    </Tooltip>
  ) : (
    card
  );
};
