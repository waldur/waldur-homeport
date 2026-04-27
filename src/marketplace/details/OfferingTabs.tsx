import { NestedSection, PublicOfferingDetails } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ImagesTab } from '@/marketplace/offerings/images/ImagesTab';

import { PublicOfferingComponentsTable } from '../offerings/details/PublicOfferingComponentsTable';
import { PublicOfferingPricing } from '../offerings/details/PublicOfferingPricing';

import { AttributesTable } from './attributes/AttributesTable';
import { OfferingTab } from './OfferingTabsComponent';
import { ProviderLocationTab } from './ProviderLocationTab';

interface OfferingTabsProps {
  sections: NestedSection[];
  offering: PublicOfferingDetails;
  order?: any;
  concealBillingInfo?: boolean;
}

export const getTabs = (props: OfferingTabsProps): OfferingTab[] => {
  const attributes = props.offering.attributes;
  const filterSection = (section: NestedSection) =>
    section.attributes.some((attr) =>
      Object.prototype.hasOwnProperty.call(props.offering.attributes, attr.key),
    );
  const sections = props.sections.filter(filterSection);

  const basicSections = sections.filter((s) => s.is_standalone === false);
  const standaloneSections = sections.filter((s) => s.is_standalone === true);

  let tabs = [
    {
      visible:
        !!props.offering.full_description || !!props.offering.description,
      title: translate('Description'),
      component: () => (
        <SafeMarkdown
          text={props.offering.full_description || props.offering.description}
        />
      ),
    },
    {
      visible:
        !isFeatureVisible(MarketplaceFeatures.catalogue_only) &&
        !isFeatureVisible(
          MarketplaceFeatures.conceal_offering_pricing_tab_in_public_view,
        ) &&
        !props.offering.plugin_options['conceal_billing_data'] &&
        props.offering.plans?.length > 0 &&
        !props.concealBillingInfo,
      title: translate('Pricing'),
      component: () => <PublicOfferingPricing offering={props.offering} />,
    },
    {
      visible:
        !isFeatureVisible(MarketplaceFeatures.catalogue_only) &&
        !isFeatureVisible(
          MarketplaceFeatures.conceal_offering_pricing_tab_in_public_view,
        ) &&
        !props.offering.plugin_options['conceal_billing_data'],
      title: translate('Components'),
      component: () => (
        <PublicOfferingComponentsTable
          offering={props.offering}
          hideActionBar
          fullWidth
        />
      ),
    },
    {
      visible: basicSections.length > 0,
      title: translate('Features'),
      component: () => (
        <AttributesTable attributes={attributes} sections={basicSections} />
      ),
    },
    {
      visible: props.offering.screenshots.length > 0,
      title: translate('Images'),
      component: () => <ImagesTab images={props.offering.screenshots} />,
    },
    {
      visible: Boolean(props.offering.latitude && props.offering.longitude),
      title: translate('Provider location'),
      component: () => <ProviderLocationTab offering={props.offering} />,
    },
  ];

  standaloneSections.forEach((section) => {
    tabs.push({
      visible: true,
      title: section.title,
      component: () => (
        <AttributesTable attributes={attributes} sections={[section]} />
      ),
    });
  });
  tabs = tabs.filter((tab) => tab.visible);
  return tabs;
};
