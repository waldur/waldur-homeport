import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { TranslateProps } from '@waldur/i18n';

import { OrderItemResponse } from './types';

interface ShoppingCartItemDetailsProps extends TranslateProps {
  item: OrderItemResponse;
}

const supportOfferingTemplate = 'Support.OfferingTemplate';

export const ShoppingCartItemDetails: React.SFC<ShoppingCartItemDetailsProps> = (props: ShoppingCartItemDetailsProps) => {
  if (!props.item.offering_description && !props.item.resource_uuid) {
    return null;
  }
  return (
    <p>
      <b>{props.translate('Details')}:</b>
      <br/>
      {props.item.offering_description &&
        <>
          {props.item.offering_description}
          <br/>
        </>
      }
      {props.item.resource_uuid && props.item.resource_type === supportOfferingTemplate ? (
        <Link
          state="offeringDetails"
          params={{
            uuid: props.item.resource_uuid,
          }}
          label={props.translate('Offering link')}
        />
      ) : props.item.resource_uuid && props.item.resource_type && (
            <Link
              state="resources.details"
              params={{
                resource_type: props.item.resource_type,
                uuid: props.item.resource_uuid,
              }}
              label={props.translate('Resource link')}
            />
          )
      }
    </p>
  );
};
