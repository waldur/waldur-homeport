import { FC, useEffect } from 'react';
import { NestedAttribute, NestedSection } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AttributeRowActions } from './AttributeRowActions';
import { SectionRowActions } from './SectionRowActions';

const ATTRIBUTE_TYPE_LABELS: Record<string, string> = {
  integer: 'Integer',
  string: 'String',
  text: 'Text',
  boolean: 'Boolean',
  list: 'Dropdown',
  choice: 'Choice',
};

const formatAttributeType = (type: string) =>
  ATTRIBUTE_TYPE_LABELS[type] || type;

const formatDefaultValue = (attr: NestedAttribute) => {
  if (attr.type === 'choice' && attr.default && attr.options?.length) {
    const option = attr.options.find((o) => o.key === attr.default);
    return option?.title ?? attr.default;
  }
  return attr.default;
};

interface SectionExpandableRowProps {
  row: NestedSection;
  category: Category;
  categoriesRefetch?: () => void;
}

const SectionExpandableRow: FC<SectionExpandableRowProps> = ({
  row: section,
  category,
  categoriesRefetch,
}) => {
  const tableProps = useTable({
    table: 'CategoryAttributes-' + section.key,
    fetchData: () =>
      Promise.resolve({
        rows: section.attributes || [],
        resultCount: section.attributes?.length || 0,
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [section.attributes]);

  return (
    <ExpandableContainer>
      <Table<NestedAttribute>
        {...tableProps}
        columns={[
          {
            title: translate('Attributes'),
            render: ({ row: attr }) => renderFieldOrDash(attr.title),
            width: '100px',
          },
          {
            title: translate('Type'),
            render: ({ row: attr }) =>
              renderFieldOrDash(formatAttributeType(attr.type || '')),
            width: '90px',
          },
          {
            title: translate('Required'),
            render: ({ row: attr }) =>
              attr.required ? translate('Yes') : translate('No'),
            width: '70px',
          },
          {
            title: translate('Default Value'),
            render: ({ row: attr }) =>
              renderFieldOrDash(formatDefaultValue(attr)),
            width: '100px',
          },
        ]}
        verboseName={translate('Attributes')}
        hasActionBar={false}
        minHeight="auto"
        rowKey="key"
        rowActions={({ row, fetch }) => (
          <AttributeRowActions
            row={row}
            section={section}
            category={category}
            refetch={categoriesRefetch ?? fetch}
          />
        )}
      />
    </ExpandableContainer>
  );
};

interface CategoryExpandableRowProps {
  row: Category;
  fetch: () => void;
}

export const CategoryExpandableRow: FC<CategoryExpandableRowProps> = ({
  row: category,
  fetch: categoriesRefetch,
}) => {
  const sections = category.sections || [];
  const tableProps = useTable({
    table: 'CategorySections-' + category.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: sections,
        resultCount: sections.length,
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [sections]);

  return (
    <ExpandableContainer>
      <Table<NestedSection>
        {...tableProps}
        className="sections-table-no-actions-divider"
        columns={[
          {
            title: translate('Sections'),
            render: ({ row: section }) => renderFieldOrDash(section.title),
          },
          {
            title: translate('Attributes'),
            render: ({ row: section }) => section.attributes?.length ?? 0,
          },
        ]}
        verboseName={translate('Sections')}
        expandableRow={(props) => (
          <SectionExpandableRow
            {...props}
            category={category}
            categoriesRefetch={categoriesRefetch}
          />
        )}
        isRowExpandable={(section) => (section.attributes?.length ?? 0) > 0}
        hasActionBar={false}
        minHeight="auto"
        rowKey="key"
        hideExpandAllHeader
        rowActions={({ row }) => (
          <SectionRowActions
            row={row}
            category={category}
            refetch={categoriesRefetch}
          />
        )}
      />
    </ExpandableContainer>
  );
};
