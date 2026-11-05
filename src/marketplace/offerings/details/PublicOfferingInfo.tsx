import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Card, CardContent } from 'waldur-ui';

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
    <Card bordered className="mb-8" id="getting-started">
      <CardContent>
        <PublicOfferingCardTitle>
          {translate('Description')}
        </PublicOfferingCardTitle>
        <SafeMarkdown
          text={offering.full_description || offering.description}
        />

        <PublicOfferingAttributesCard offering={offering} category={category} />
      </CardContent>
    </Card>
  );
};
