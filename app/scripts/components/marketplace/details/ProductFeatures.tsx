import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { sections } from '@waldur/marketplace/fixtures';

export const ProductFeatures = props => (
  <Table
    bordered={true}
    hover={true}
    responsive={true}
    className="m-t-md"
  >
     <tbody>
      {sections.map((section, index) => (
        <FeatureSection
          key={index}
          section={section}
          product={props.product}
        />
      ))}
    </tbody>
  </Table>
);

const FeatureSection = props => (
  <>
    <tr className="gray-bg">
      <th>{props.section.title}</th>
      <th/>
    </tr>
    {props.section.features.map((feature, index) => (
      <tr key={index}>
        <td className="col-md-3">
          {feature.title}
        </td>
        <td className="col-md-9">
          {
            feature.render ?
            feature.render(props.product[feature.key]) :
            props.product[feature.key]
          }
        </td>
      </tr>
    ))}
  </>
);
