import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';

import { PublicOfferingAttributesCard } from './PublicOfferingAttributesCard';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => {
  return (
    <Panel
      title={translate('Description')}
      cardBordered
      className="mb-8"
      id="description"
    >
      <SafeMarkdown
        text={offering.full_description || offering.description}
        smallTitles
      />

      <PublicOfferingAttributesCard offering={offering} category={category} />
    </Panel>
  );
};
