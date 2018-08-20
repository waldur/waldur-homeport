import * as React from 'react';

import { Section, Product } from '@waldur/marketplace/types';

interface FeatureSectionProps {
  section: Section;
  product: Product;
}

const AttributeRow = ({ product, attribute }) => (
  <tr>
    <td className="col-md-3">
      {attribute.title}
    </td>
    <td className="col-md-9">
      {
        attribute.render ?
        attribute.render(product[attribute.key]) :
        product[attribute.key]
      }
    </td>
  </tr>
);

export const FeatureSection = (props: FeatureSectionProps) => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      <th/>
    </tr>
    {props.section.attributes
      .filter(attr => props.product.hasOwnProperty(attr.key))
      .map((attr, index) => (
        <AttributeRow
          key={index}
          product={props.product}
          attribute={attr}/>
    ))}
  </>
);
