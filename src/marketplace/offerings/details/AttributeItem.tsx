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
      {/* Rows read `title: value` on one line, as they did as plain divs. */}
      <PropertyList variant="summary" termWidth="auto">
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
