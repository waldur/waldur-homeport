import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { renderOfferingComponents } from '@waldur/marketplace/offerings/utils';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/OrderItemDetailsField';
import { OrderItemDetailsSection } from '@waldur/marketplace/orders/OrderItemDetailsSection';
import { OfferingDetailsProps } from '@waldur/marketplace/types';
import BooleanField from '@waldur/table-react/BooleanField';

const renderValue = value => value ? value : <span>&mdash;</span>;

const renderDynamicAttributes = (offering, attributes) => {
  for (const key in offering.options.options) {
    if (attributes[key] !== undefined) {
      return (
        <OrderItemDetailsField label={offering.options.options[key].label}>
          {typeof attributes[key] === 'boolean' ? <BooleanField value={attributes[key]}/> : renderValue(attributes[key])}
        </OrderItemDetailsField>
      );
    }
  }
};

export const OfferingConfigurationDetails = (props: OfferingDetailsProps) => {
  const { uuid, attributes } = props.orderItem;
  return (
    <>
      <OrderItemDetailsField>
        <OrderItemDetailsSection>
          {translate('Attributes')}
        </OrderItemDetailsSection>
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('UUID')}>
        {renderValue(uuid)}
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('Created at')}>
        {formatDateTime(props.orderItem.created)}
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('Components')}>
        {renderValue(renderOfferingComponents(props.offering))}
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('Name')}>
        {renderValue(attributes.name)}
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('Description')}>
        {renderValue(attributes.description)}
      </OrderItemDetailsField>
      {renderDynamicAttributes(props.offering, attributes)}
      <PlanDetails orderItem={props.orderItem} offering={props.offering} translate={translate}/>
    </>
  );
};
