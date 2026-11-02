import { FunctionComponent } from 'react';
import { NestedSection } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { AttributeCell } from '@/marketplace/common/AttributeCell';
import { renderFieldOrDash } from '@/table/utils';

interface AttributeSectionProps {
  section: NestedSection;
  attributes: any;
  hideHeader: boolean;
}

export const AttributeSection: FunctionComponent<AttributeSectionProps> = (
  props,
) => (
  <PropertyList hideActions>
    <PropertyList.Section
      title={!props.hideHeader ? props.section.title : undefined}
    >
      {props.section.attributes.map((attr, index) => (
        <PropertyItem
          key={index}
          label={attr.title}
          value={
            <AttributeCell
              attr={attr}
              value={renderFieldOrDash(props.attributes[attr.key])}
            />
          }
        />
      ))}
    </PropertyList.Section>
  </PropertyList>
);
