import { FunctionComponent, useMemo } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { Category } from '@/marketplace/types';

import { OfferingSectionList } from './OfferingSectionList';
import { getFilledSections, SECTION_TAB_PREFIX } from './offeringSections';

interface PublicOfferingSectionTabProps {
  offering: Offering;
  category: Category;
  tabSpec?: { key: string };
}

/**
 * A category section marked "Show as a separate tab". One component serves
 * every such tab; the tab key names the section.
 */
export const PublicOfferingSectionTab: FunctionComponent<
  PublicOfferingSectionTabProps
> = ({ offering, category, tabSpec }) => {
  const sectionKey = tabSpec?.key?.slice(SECTION_TAB_PREFIX.length);
  const section = useMemo(
    () =>
      getFilledSections(category?.sections, offering?.attributes).find(
        (item) => item.key === sectionKey,
      ),
    [category, offering, sectionKey],
  );
  if (!section) {
    return null;
  }
  return (
    <Panel
      title={section.title}
      cardBordered
      className="mb-8"
      id={tabSpec?.key}
    >
      <OfferingSectionList
        sections={[section]}
        attributes={offering.attributes}
        hideTitles
      />
    </Panel>
  );
};
