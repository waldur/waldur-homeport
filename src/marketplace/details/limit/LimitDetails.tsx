import { translate, TranslateProps, withTranslation } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';

interface LimitDetailsProps extends TranslateProps {
  limits: Limits;
}

export const LimitDetails = withTranslation((props: LimitDetailsProps) => (
  <>
    {Object.keys(props.limits).map((key) => (
      <OrderItemDetailsField key={key} label={translate(key)}>
        {props.limits[key]}
      </OrderItemDetailsField>
    ))}
  </>
));
