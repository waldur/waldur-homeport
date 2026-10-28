import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';

import { PublicOfferingAttributesCard } from './PublicOfferingAttributesCard';
import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => {
  return (
    <div className="card card-bordered mb-8" id="getting-started">
      <div className="card-body">
        <PublicOfferingCardTitle>
          {translate('Description')}
        </PublicOfferingCardTitle>
        <SafeMarkdown
          text={offering.full_description || offering.description}
        />

        <PublicOfferingAttributesCard offering={offering} category={category} />
      </div>
    </div>
  );
};
