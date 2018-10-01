import * as classNames from 'classnames';
import * as React from 'react';

import { range } from '@waldur/core/utils';
import { COMPARISON_COLUMNS } from '@waldur/marketplace/compare/store/constants';

import { Offering, Section } from '../types';

interface ComparisonSectionProps {
  items: Offering[];
  section: Section;
}

const renderAttribute = (index, offeringAttribute, categoryAttribute) => {
  const offeringAttributeValue = offeringAttribute[categoryAttribute.key];
  if (Array.isArray(offeringAttributeValue)) {
    return (
      <td key={index}>
        {offeringAttributeValue.map((el, i) => {
          const categoryAttributeOption = categoryAttribute.options.find(option => option.key === el);
          return (
            <span key={i}>
              <i className="fa fa-check"/>{` ${categoryAttributeOption.title}`}
              <br/>
            </span>
          );
        })}
      </td>
    );
  }
  if (typeof offeringAttributeValue === 'boolean') {
    return (
      <td key={index} className="text-center">
        <i className={classNames('text-center',
          offeringAttributeValue ? 'fa fa-check text-info' : 'fa fa-times text-danger')} />
      </td>
    );
  } else {
    let categoryAttributeOption = null;
    if (offeringAttributeValue) {
      categoryAttributeOption = categoryAttribute.options.find(option => option.key === offeringAttributeValue);
    }
    return <td key={index}>{categoryAttributeOption ? categoryAttributeOption.title : ''}</td>;
  }
};

export const ComparisonSection = (props: ComparisonSectionProps) => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      {props.items.map((item, index) => (
        <th key={index}>
          {item.name}
        </th>
      ))}
      {props.items.length < COMPARISON_COLUMNS && range(COMPARISON_COLUMNS - props.items.length).map(index =>
        <td key={index}/>
      )}
    </tr>
    {props.section.attributes.map((attribute, index1) => (
      <tr key={index1}>
        <td>
          {attribute.title}
        </td>
        {props.items.map((item, index2) =>
          renderAttribute(index2, item.attributes, attribute)
        )}
        {props.items.length < COMPARISON_COLUMNS && range(COMPARISON_COLUMNS - props.items.length).map(index =>
          <td key={index}/>
        )}
      </tr>
    ))}
  </>
);
