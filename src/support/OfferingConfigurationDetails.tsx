import { FunctionComponent } from 'react';

import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { BooleanField } from '@waldur/table/BooleanField';

const renderValue = (value) => (value ? value : <>&mdash;</>);

export const OfferingConfigurationDetails: FunctionComponent<OrderDetailsProps> =
  (props) => {
    const options = props.offering.options.options || {};
    const attributes = props.order.attributes;
    const keys = Object.keys(options).filter(
      (key) => attributes[key] !== undefined,
    );
    return (
      <>
        {keys.map((key, index) => (
          <DetailsField label={options[key].label} key={index}>
            {typeof attributes[key] === 'boolean' ? (
              <BooleanField value={attributes[key]} />
            ) : (
              renderValue(attributes[key])
            )}
          </DetailsField>
        ))}
      </>
    );
  };
