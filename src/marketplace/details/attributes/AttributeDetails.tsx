import { translate, TranslateProps, withTranslation } from '@waldur/i18n';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { AttributesType } from '@waldur/marketplace/types';

interface AttributeDetailsProps extends TranslateProps {
  attributes: AttributesType;
}

export const AttributeDetails = withTranslation(
  (props: AttributeDetailsProps) => (
    <>
      {Object.keys(props.attributes)
        .filter((key) => typeof props.attributes[key] === 'string')
        .map((key) => (
          <OrderItemDetailsField key={key} label={translate(key)}>
            {props.attributes[key]}
          </OrderItemDetailsField>
        ))}
    </>
  ),
);
