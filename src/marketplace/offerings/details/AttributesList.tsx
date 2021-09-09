import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { AttributeItem } from '@waldur/marketplace/offerings/details/AttributeItem';
import { Section } from '@waldur/marketplace/types';

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
      <div
        key={index}
        className={classNames({
          'm-t-lg': index !== 0,
        })}
      >
        <AttributeItem section={section} attributes={attributes} />
      </div>
    ))}
  </>
);
