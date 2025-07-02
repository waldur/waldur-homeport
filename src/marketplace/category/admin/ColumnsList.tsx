import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import { ColumnRow } from './ColumnRow';

const CategoryColumnsPlaceholder: FC<{ category: Category }> = ({
  category,
}) => (
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
  category;
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
      <PlusIcon weight="bold" />
    </span>{' '}
    {translate('Add column')}
  </Button>
);

export const ColumnsList: FC<ColumnsListProps> = ({
  fields,
  CategoryColumns,
  category,
}) => (
  <>
    <Table bordered>
      {fields.length === 0 && CategoryColumns.length === 0 ? (
        <tbody>
          <CategoryColumnsPlaceholder category={category} />
        </tbody>
      ) : (
        <>
          <thead>
            <ColumnsHeader />
          </thead>
          <tbody>
            {fields.map((column, index) => (
              <FormSection name={column} key={index}>
                <ColumnRow
                  column={CategoryColumns[index]}
                  fields={fields}
                  index={index}
                />
              </FormSection>
            ))}
          </tbody>
        </>
      )}
    </Table>
    <ColumnAddButton fields={fields} />
  </>
);
