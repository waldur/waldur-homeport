import { FunctionComponent } from 'react';

import FormTable from '@/form/FormTable';
import { OrderDetailsProps } from '@/marketplace/types';
import { BooleanField } from '@/table/BooleanField';

const renderValue = (value) => (value ? value : <>&mdash;</>);

export const OfferingConfigurationDetails: FunctionComponent<
  OrderDetailsProps
> = (props) => {
  const options = props.offering.options.options || {};
  const attributes = props.order.attributes;
  const keys = Object.keys(options).filter(
    (key) => attributes[key] !== undefined,
  );
  return (
    <>
      {keys.map((key, index) => (
        <FormTable.Item label={options[key].label} key={index}>
          {typeof attributes[key] === 'boolean' ? (
            <BooleanField value={attributes[key]} />
          ) : (
            renderValue(attributes[key])
          )}
        </FormTable.Item>
      ))}
    </>
  );
};
