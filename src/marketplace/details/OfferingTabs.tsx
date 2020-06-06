import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { Section, Offering } from '@waldur/marketplace/types';

import { AttributesTable } from './attributes/AttributesTable';
import { OfferingTab } from './OfferingTabsComponent';
import { OverviewTab } from './OverviewTab';
import { ScreenshotsTab } from './ScreenshotsTab';

interface OfferingTabsProps {
  sections: Section[];
  offering: Offering;
}

export const getTabs = (props: OfferingTabsProps): OfferingTab[] => {
  const attributes = props.offering.attributes;
  const filterSection = (section: Section) =>
    section.attributes.some(attr =>
      props.offering.attributes.hasOwnProperty(attr.key),
    );
  const sections = props.sections.filter(filterSection);

  const basicSections = sections.filter(s => s.is_standalone === false);
  const standaloneSections = sections.filter(s => s.is_standalone === true);

  let tabs = [
    {
      visible: !!props.offering.full_description,
      title: translate('Description'),
      component: () => <OverviewTab offering={props.offering} />,
    },
    {
      visible: !!props.offering.terms_of_service,
      title: translate('Terms of service'),
      component: () => <FormattedHtml html={props.offering.terms_of_service} />,
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
      title: translate('Screenshots'),
      component: () => (
        <ScreenshotsTab screenshots={props.offering.screenshots} />
      ),
    },
  ];

  standaloneSections.forEach(section => {
    tabs.push({
      visible: true,
      title: section.title,
      component: () => (
        <AttributesTable attributes={attributes} sections={[section]} />
      ),
    });
  });
  tabs = tabs.filter(tab => tab.visible);
  return tabs;
};
