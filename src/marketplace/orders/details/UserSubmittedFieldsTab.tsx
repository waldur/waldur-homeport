import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

export const UserSubmittedFieldsTab = ({ order }) => {
  return (
    <FormTable.Card title={translate('User submitted fields')}>
      <FormTable detailsMode>
        {order.attributes &&
          Object.entries(order.attributes).map(([key, value]) => (
            <FormTable.Item
              key={key}
              label={key}
              value={<FieldWithCopy value={value} />}
            />
          ))}
      </FormTable>
    </FormTable.Card>
  );
};
