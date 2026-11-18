import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { NestedSection as Section } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { AttributeCell } from '@/marketplace/common/AttributeCell';

import { isValidAttribute } from './utils';

interface AttributeItemProps {
  index: number;
  section: Section;
  attributes: any;
}

export const AttributeItem: FunctionComponent<AttributeItemProps> = (props) => {
  const filteredAttributes = props.section.attributes.filter((attr) =>
    Object.prototype.hasOwnProperty.call(props.attributes, attr.key),
  );
  return filteredAttributes.length ? (
    <div
      className={classNames({
        'mt-4': props.index !== 0,
      })}
    >
      <b>{props.section.title}</b>
      {/* A fixed term column, so every value in the section starts at the
          same x: `auto` sizes each row's label track to its own label. */}
      <PropertyList variant="summary" className="mt-2">
        {filteredAttributes
          .filter((attr) => isValidAttribute(props.attributes[attr.key]))
          .map((attr, index) => (
            <PropertyItem
              key={index}
              label={attr.title}
              value={
                <AttributeCell attr={attr} value={props.attributes[attr.key]} />
              }
            />
          ))}
      </PropertyList>
    </div>
  ) : null;
};
