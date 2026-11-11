import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';

import { ColumnRow } from './ColumnRow';

const CategoryColumnsPlaceholder: FC<{ category: Category }> = ({
  category,
}) => (
  <TableRow>
    <TableCell className="text-center" colSpan={5}>
      {translate('Category {category} does not contain a column yet.', {
        category: category.title,
      })}
    </TableCell>
  </TableRow>
);

interface ColumnsListProps extends FieldArrayRenderProps<any, HTMLElement> {
  CategoryColumns: any[];
  category: Category;
}

const ColumnsHeader: FC = () => (
  <TableRow>
    <TableHead>{translate('Title')}</TableHead>
    <TableHead>{translate('Attribute')}</TableHead>
    <TableHead>{translate('Widget')}</TableHead>
    <TableHead>{translate('Index')}</TableHead>
    <TableHead>{translate('Actions')}</TableHead>
  </TableRow>
);

const ColumnAddButton = ({ fields }) => (
  <BaseButton
    variant="primary"
    onClick={() => fields.push({})}
    iconNode={<PlusIcon weight="bold" />}
    label={translate('Add column')}
    size="sm"
  />
);

export const ColumnsList: FC<ColumnsListProps> = ({
  fields,
  CategoryColumns,
  category,
}) => (
  <>
    <Table>
      {fields.length === 0 && CategoryColumns.length === 0 ? (
        <TableBody>
          <CategoryColumnsPlaceholder category={category} />
        </TableBody>
      ) : (
        <>
          <TableHeader>
            <ColumnsHeader />
          </TableHeader>
          <TableBody>
            {fields.map((column, index) => (
              <ColumnRow
                key={index}
                column={CategoryColumns[index]}
                fields={fields}
                index={index}
                name={column}
              />
            ))}
          </TableBody>
        </>
      )}
    </Table>
    <ColumnAddButton fields={fields} />
  </>
);
