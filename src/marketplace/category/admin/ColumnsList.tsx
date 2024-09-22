import { Plus } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FormName, FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { deleteCategoryColumn } from './api';
import { ColumnRow } from './ColumnRow';

const CategoryColumnsPlaceholder: FC = (category: Category) => (
  <tr>
    <td className="text-center" colSpan={5}>
      {translate('Category {category} does not contain a column yet.', {
        category: category.title,
      })}
    </td>
  </tr>
);

interface ColumnsListProps extends WrappedFieldArrayProps {
  CategoryColumns: any[];
  dispatch: any;
}

const ColumnsHeader: FC = () => (
  <tr>
    <th>{translate('Title')}</th>
    <th>{translate('Attribute')}</th>
    <th>{translate('Widget')}</th>
    <th>{translate('Index')}</th>
    <th>{translate('Actions')}</th>
  </tr>
);

const ColumnAddButton = ({ fields }) => (
  <Button variant="primary" size="sm" onClick={() => fields.push({})}>
    <span className="svg-icon svg-icon-2">
      <Plus />
    </span>{' '}
    {translate('Add column')}
  </Button>
);

const handleRemove = async (fields, index, column, dispatch) => {
  try {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to remove this column: {title}?', {
        title: column.title,
      }),
    );
  } catch {
    return;
  }
  try {
    await deleteCategoryColumn(column.uuid);
    fields.remove(index);
    dispatch(showSuccess(translate('Column has been removed successfully.')));
  } catch (e) {
    dispatch(showErrorResponse(e, translate('Unable to remove column.')));
  }
};

export const ColumnsList: FC<ColumnsListProps> = ({
  fields,
  CategoryColumns,
  dispatch,
}) => (
  <>
    <Table bordered>
      {fields.length === 0 && CategoryColumns.length === 0 ? (
        <tbody>
          <CategoryColumnsPlaceholder />
        </tbody>
      ) : (
        <>
          <thead>
            <ColumnsHeader />
          </thead>
          <tbody>
            <FormName>
              {({ form }) =>
                fields.map((column, index) => (
                  <FormSection name={column} key={index}>
                    <ColumnRow
                      formName={form}
                      column={column}
                      onRemove={() =>
                        handleRemove(
                          fields,
                          index,
                          CategoryColumns[index],
                          dispatch,
                        )
                      }
                      CategoryColumns={CategoryColumns}
                    />
                  </FormSection>
                ))
              }
            </FormName>
          </tbody>
        </>
      )}
    </Table>
    <ColumnAddButton fields={fields} />
  </>
);
