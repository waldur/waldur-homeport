import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { NestedSection as Section } from 'waldur-js-client';

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
        'mt-5': props.index !== 0,
      })}
    >
      <b>{props.section.title}</b>
      {filteredAttributes
        .filter((attr) => isValidAttribute(props.attributes[attr.key]))
        .map((attr, index) => (
          <div key={index}>
            {attr.title}:{' '}
            {props.attributes[attr.key] && (
              <AttributeCell attr={attr} value={props.attributes[attr.key]} />
            )}
          </div>
        ))}
    </div>
  ) : null;
};
