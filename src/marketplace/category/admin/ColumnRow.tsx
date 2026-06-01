import { Field } from 'react-final-form';
import { marketplaceCategoryColumnsDestroy } from 'waldur-js-client';

import { SelectField } from '@/form/select/SelectField';
import { StringField } from '@/form/StringField';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';

export const ColumnRow = ({ column, fields, index, name }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const onRemove = async () => {
    if (!column?.uuid) {
      fields.remove(index);
      return;
    }
    try {
      await confirm(
        translate('Confirmation'),
        translate(
          'Are you sure you want to remove this column: {title}?',
          {
            title: <strong>{column.title}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplaceCategoryColumnsDestroy({ path: { uuid: column.uuid } });
      fields.remove(index);
      showSuccess(translate('Column has been removed successfully.'));
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove column.'));
    }
  };

  return (
    <tr>
      <td>
        <Field
          name={`${name}.title`}
          component={StringField}
          placeholder={translate('Title is rendered as column header')}
          aria-label={translate('Title')}
        />
      </td>
      <td>
        <Field
          name={`${name}.attribute`}
          component={StringField}
          placeholder={translate(
            'Resource attribute is rendered as table cell',
          )}
          aria-label={translate('Attribute')}
        />
      </td>
      <td>
        <Field
          name={`${name}.widget`}
          component={SelectField}
          placeholder={translate(
            'Widget field allows to customise table cell rendering',
          )}
          options={[
            { value: '', label: translate('None') },
            { value: 'csv', label: 'CSV' },
            { value: 'filesize', label: translate('Filesize') },
            {
              value: 'attached_instance',
              label: translate('Attached instance'),
            },
          ]}
          isClearable
        />
      </td>
      <td>
        <Field
          name={`${name}.index`}
          component={StringField}
          placeholder={translate('Index allows to reorder columns')}
          aria-label={translate('Index')}
        />
      </td>
      <td>
        <RemovalActionButton action={onRemove} tooltip={translate('Remove')} />
      </td>
    </tr>
  );
};
