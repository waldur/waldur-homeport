import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  Attribute,
  marketplaceAttributesDestroy,
  marketplaceAttributesList,
  marketplaceSectionsDestroy,
  marketplaceSectionsList,
  Section,
} from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { formatAttributeType, formatDefaultValue } from './utils';

const SectionFormDialog = lazyComponent(() =>
  import('./SectionFormDialog').then((module) => ({
    default: module.SectionFormDialog,
  })),
);

const AttributeFormDialog = lazyComponent(() =>
  import('./AttributeFormDialog').then((module) => ({
    default: module.AttributeFormDialog,
  })),
);

const sectionsTableId = (categoryUuid: string) =>
  `category-sections-${categoryUuid}`;
const attributesTableId = (sectionKey: string) =>
  `category-section-attributes-${sectionKey}`;

/**
 * Sections and attributes are added from the parent row's menu, which only
 * holds the parent table's refetch; this refreshes the nested table, which
 * keeps its own query, directly.
 */
const useRefreshTable = () => {
  const queryClient = useQueryClient();
  return (table: string) =>
    queryClient.invalidateQueries({ queryKey: ['table', table] });
};

// The key sits under the title rather than in a column of its own: keys run
// long, and a column for them pushed the default value behind the actions.
const TitleWithKey: FC<{ title: string; itemKey?: string }> = ({
  title,
  itemKey,
}) => (
  <div className="flex flex-col">
    <span>{title}</span>
    <span className="font-mono text-xs text-tertiary break-all">{itemKey}</span>
  </div>
);

export const CategoryAddSectionAction: FC<{
  row: Category;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const refreshTable = useRefreshTable();
  const onSaved = () => {
    refetch();
    refreshTable(sectionsTableId(row.uuid));
  };
  return (
    <ActionItem
      title={translate('Add section')}
      action={() =>
        openDialog(SectionFormDialog, {
          resolve: { category: row, refetch: onSaved },
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

const SectionAddAttributeAction: FC<{ row: Section }> = ({ row }) => {
  const { openDialog } = useModal();
  const refreshTable = useRefreshTable();
  return (
    <ActionItem
      title={translate('Add attribute')}
      action={() =>
        openDialog(AttributeFormDialog, {
          resolve: {
            section: row,
            refetch: () => refreshTable(attributesTableId(row.key)),
          },
          size: 'lg',
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

const AttributeRemoveAction: FC<{ row: Attribute; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      marketplaceAttributesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('The attribute has been removed.'),
    errorMessage: translate('Unable to remove the attribute.'),
    refetch,
    confirmation: {
      title: translate('Remove attribute'),
      body: translate(
        'Remove the {title} attribute? Offerings keep the values they hold for it, but they are no longer shown.',
        { title: <strong>{row.title}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};

const SectionAttributesTable: FC<{ row: Section }> = ({ row: section }) => {
  const filter = useMemo(() => ({ section: section.url }), [section.url]);
  const tableProps = useTable({
    table: attributesTableId(section.key),
    fetchData: createFetcher(marketplaceAttributesList),
    filter,
  });

  const columns: Column<Attribute>[] = [
    {
      title: translate('Attribute'),
      render: ({ row }) => <TitleWithKey title={row.title} itemKey={row.key} />,
    },
    {
      title: translate('Type'),
      render: ({ row }) => formatAttributeType(row.type),
    },
    {
      title: translate('Required'),
      render: ({ row }) => (row.required ? translate('Yes') : translate('No')),
    },
    {
      title: translate('Default value'),
      render: ({ row }) => renderFieldOrDash(formatDefaultValue(row)),
    },
  ];

  return (
    <ExpandableContainer>
      <Table<Attribute>
        {...tableProps}
        columns={columns}
        verboseName={translate('attributes')}
        hasActionBar={false}
        minHeight="auto"
        placeholderHasRetry={false}
        rowActions={({ row }) => (
          <ActionsDropdown>
            <EditModalButton
              dialog={AttributeFormDialog}
              row={row}
              buildResolve={(attribute) => ({
                section,
                attribute,
                refetch: tableProps.fetch,
              })}
            />
            <AttributeRemoveAction row={row} refetch={tableProps.fetch} />
          </ActionsDropdown>
        )}
      />
    </ExpandableContainer>
  );
};

const SectionRemoveAction: FC<{ row: Section; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => marketplaceSectionsDestroy({ path: { key: row.key } }),
    successMessage: translate('The section has been removed.'),
    errorMessage: translate('Unable to remove the section.'),
    refetch,
    confirmation: {
      title: translate('Remove section'),
      body: translate(
        'Remove the {title} section and all of its attributes? Offerings keep the values they hold for them, but they are no longer shown.',
        { title: <strong>{row.title}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};

/**
 * The sections of a category and, inside each, its attributes: the fields
 * offerings in the category fill in under Public information → Category.
 * Sections are added from the category's menu, attributes from the section's.
 */
export const CategoryStructurePanel: FC<{
  row: Category;
  fetch?(): void;
}> = ({ row: category, fetch: refetchCategories }) => {
  const filter = useMemo(
    () => ({ category_uuid: category.uuid }),
    [category.uuid],
  );
  const tableProps = useTable({
    table: sectionsTableId(category.uuid),
    fetchData: createFetcher(marketplaceSectionsList),
    filter,
  });

  // The categories table shows a section count, so it refreshes too.
  const refetch = () => {
    tableProps.fetch();
    refetchCategories?.();
  };

  const columns: Column<Section>[] = [
    {
      title: translate('Section'),
      render: ({ row }) => <TitleWithKey title={row.title} itemKey={row.key} />,
    },
    {
      title: translate('Separate tab'),
      render: ({ row }) =>
        row.is_standalone ? translate('Yes') : translate('No'),
    },
  ];

  return (
    <ExpandableContainer>
      <Table<Section>
        {...tableProps}
        columns={columns}
        verboseName={translate('sections')}
        hasActionBar={false}
        minHeight="auto"
        placeholderHasRetry={false}
        expandableRow={SectionAttributesTable}
        rowKey="key"
        rowActions={({ row }) => (
          <ActionsDropdown>
            <SectionAddAttributeAction row={row} />
            <EditModalButton
              dialog={SectionFormDialog}
              row={row}
              buildResolve={(section) => ({ category, section, refetch })}
            />
            <SectionRemoveAction row={row} refetch={refetch} />
          </ActionsDropdown>
        )}
      />
    </ExpandableContainer>
  );
};
