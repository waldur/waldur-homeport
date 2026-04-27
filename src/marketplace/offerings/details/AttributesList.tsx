import { FunctionComponent } from 'react';
import { NestedSection as Section } from 'waldur-js-client';

import { AttributeItem } from '@/marketplace/offerings/details/AttributeItem';

interface AttributesListProps {
  sections: Section[];
  attributes: any;
}

export const AttributesList: FunctionComponent<AttributesListProps> = ({
  sections,
  attributes,
}) => (
  <>
    {sections.map((section: Section, index: number) => (
      <AttributeItem
        key={index}
        index={index}
        section={section}
        attributes={attributes}
      />
    ))}
  </>
);
