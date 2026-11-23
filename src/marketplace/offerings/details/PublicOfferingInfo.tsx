import { FunctionComponent, useMemo } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';

import { OfferingSectionList } from './OfferingSectionList';
import {
  getFilledSections,
  hasOfferingReferenceData,
  splitSections,
} from './offeringSections';
import { PublicOfferingAttributesSection } from './PublicOfferingAttributesSection';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => {
  const description = offering.full_description || offering.description;
  // Sections marked as a separate tab are shown on tabs of their own.
  const { grouped } = useMemo(
    () =>
      splitSections(getFilledSections(category?.sections, offering.attributes)),
    [category, offering.attributes],
  );
  const hasReferenceData = hasOfferingReferenceData(offering);
  const showAttributes = grouped.length > 0 || hasReferenceData;

  return (
    <>
      {description && (
        <Panel
          title={translate('Description')}
          cardBordered
          className="mb-8"
          id="description"
        >
          <SafeMarkdown text={description} smallTitles />
        </Panel>
      )}
      {showAttributes && (
        <Panel
          title={translate('Attributes')}
          cardBordered
          className="mb-8"
          id="attributes"
        >
          {hasReferenceData && (
            <PublicOfferingAttributesSection offering={offering} />
          )}
          <OfferingSectionList
            sections={grouped}
            attributes={offering.attributes}
          />
        </Panel>
      )}
    </>
  );
};
