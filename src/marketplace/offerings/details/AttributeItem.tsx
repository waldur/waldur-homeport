import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';
import { Section } from '@waldur/marketplace/types';

interface AttributeItemProps {
  index: number;
  section: Section;
  attributes: any;
}

export const AttributeItem: FunctionComponent<AttributeItemProps> = (props) => {
  const filteredAttributes = props.section.attributes.filter((attr) =>
    props.attributes.hasOwnProperty(attr.key),
  );
  return filteredAttributes.length ? (
    <div
      className={classNames({
        'm-t-lg': props.index !== 0,
      })}
    >
      <b>{props.section.title}</b>
      {filteredAttributes.map((attr, index) => (
        <div key={index}>
          {attr.title}:{' '}
          <AttributeCell attr={attr} value={props.attributes[attr.key]} />
        </div>
      ))}
    </div>
  ) : null;
};
