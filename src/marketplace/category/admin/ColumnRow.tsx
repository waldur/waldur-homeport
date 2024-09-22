import { Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormField } from '@waldur/openstack/openstack-security-groups/rule-editor/FormField';

interface ColumnRowProps {
  formName: string;
  column: any;
  onRemove(): void;
  CategoryColumns: any[];
}

const WidgetField = () => (
  <Field
    name="widget"
    component={FormField}
    as="select"
    tooltip={translate('Widget field allows to customise table cell rendering')}
  >
    <option value="">{translate('None')}</option>
    <option value="csv">CSV</option>
    <option value="filesize">Filesize</option>
    <option value="attached_instance">Attached Instance</option>
  </Field>
);

export const ColumnRow: FC<ColumnRowProps> = ({ onRemove }) => {
  return (
    <tr>
      <Field
        name="title"
        component={FormField}
        tooltip={translate('Title is rendered as column header')}
      />
      <Field
        name="attribute"
        component={FormField}
        tooltip={translate('Resource attribute is rendered as table cell')}
      />
      <td>{WidgetField()}</td>
      <Field
        name="index"
        component={FormField}
        tooltip={translate('Index allows to reorder columns')}
      />
      <td>
        <Button variant="danger" onClick={onRemove}>
          <Trash />
        </Button>
      </td>
    </tr>
  );
};
