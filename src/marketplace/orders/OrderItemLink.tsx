import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { TranslateProps } from '@waldur/i18n';

import { OrderItemResponse } from './types';

interface OrderItemLinkProps extends TranslateProps {
  item: OrderItemResponse;
}

const supportOfferingTemplate = 'Support.OfferingTemplate';

export const OrderItemLink = (props: OrderItemLinkProps) => {
  if (props.item.resource_type === supportOfferingTemplate) {
    return (
      <Link
        state="offeringDetails"
        params={{
          uuid: props.item.resource_uuid,
        }}
        label={props.translate('Offering link')}
      />
    );
  } else {
    return (
      <Link
        state="resources.details"
        params={{
          resource_type: props.item.resource_type,
          uuid: props.item.resource_uuid,
        }}
        label={props.translate('Resource link')}
      />
    );
  }
};
