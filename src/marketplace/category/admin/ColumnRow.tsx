import { TrashIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceCategoryColumnsDestroy } from 'waldur-js-client';

import { SelectField } from '@waldur/form/SelectField';
import { StringField } from '@waldur/form/StringField';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

export const ColumnRow = ({ column, fields, index, name }) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const onRemove = async () => {
    if (!column?.uuid) {
      fields.remove(index);
      return;
    }
    try {
      await waitForConfirmation(
        dispatch,
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
          component={StringField as any}
          placeholder={translate('Title is rendered as column header')}
        />
      </td>

      <td>
        <Field
          name={`${name}.attribute`}
          component={StringField as any}
          placeholder={translate(
            'Resource attribute is rendered as table cell',
          )}
        />
      </td>

      <td>
        <Field
          name={`${name}.widget`}
          component={SelectField as any}
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
          component={StringField as any}
          placeholder={translate('Index allows to reorder columns')}
        />
      </td>

      <td>
        <Button variant="danger" onClick={onRemove} aria-description="Delete">
          <TrashIcon weight="bold" />
        </Button>
      </td>
    </tr>
  );
};
