import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { CompactActionButton } from '@/table/CompactActionButton';

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

interface ColumnsListProps extends FieldArrayRenderProps<any, HTMLElement> {
  CategoryColumns: any[];
  category: Category;
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
  <CompactActionButton
    variant="primary"
    action={() => fields.push({})}
    iconNode={<PlusIcon weight="bold" />}
    title={translate('Add column')}
  />
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
              <ColumnRow
                key={index}
                column={CategoryColumns[index]}
                fields={fields}
                index={index}
                name={column}
              />
            ))}
          </tbody>
        </>
      )}
    </Table>
    <ColumnAddButton fields={fields} />
  </>
);
