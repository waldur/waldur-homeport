import * as React from 'react';

export const FeatureSection = props => (
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
