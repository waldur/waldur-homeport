import { FunctionComponent } from 'react';
import { NestedSection } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { AttributeCell } from '@/marketplace/common/AttributeCell';

interface OfferingSectionListProps {
  sections: NestedSection[];
  attributes: Record<string, any>;
  /** Hide the heading when the surrounding panel already names the section. */
  hideTitles?: boolean;
}

export const OfferingSectionList: FunctionComponent<
  OfferingSectionListProps
> = ({ sections, attributes, hideTitles }) => (
  <PropertyList variant="summary" hideActions>
    {sections.map((section) => (
      <PropertyList.Section
        key={section.key}
        title={hideTitles ? undefined : section.title}
      >
        {section.attributes.map((attr) => (
          <PropertyItem
            key={attr.key}
            label={attr.title}
            value={<AttributeCell attr={attr} value={attributes[attr.key]} />}
          />
        ))}
      </PropertyList.Section>
    ))}
  </PropertyList>
);
