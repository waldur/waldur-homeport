import { FieldWithCopy } from '@/core/FieldWithCopy';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

export const UserSubmittedFieldsTab = ({ order }) => {
  return (
    <FormTable.Card title={translate('User submitted fields')}>
      <FormTable detailsMode>
        {order.attributes &&
          Object.entries(order.attributes).map(([key, value]) => (
            <FormTable.Item
              key={key}
              label={key}
              value={<FieldWithCopy value={JSON.stringify(value)} />}
            />
          ))}
      </FormTable>
    </FormTable.Card>
  );
};
