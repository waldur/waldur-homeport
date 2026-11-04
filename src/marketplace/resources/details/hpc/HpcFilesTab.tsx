import {
  ChartLineIcon,
  EyeIcon,
  FileIcon,
  FolderIcon,
  HouseIcon,
  LinkSimpleIcon,
} from '@phosphor-icons/react';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { HpcFile, hpcWorkspacesFilesList, Resource } from 'waldur-js-client';

import { BaseButton, Code, Switch } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HPC_QUERY_OPTIONS, useHpcOverview } from './queries';
import {
  getInMemoryPage,
  getPathCrumbs,
  isPlottableFile,
  joinPath,
  sortDirectoryEntries,
} from './utils';

const HpcFileContentDialog = lazyComponent(() =>
  import('./HpcFileContentDialog').then((module) => ({
    default: module.HpcFileContentDialog,
  })),
);

const FILE_ICONS = {
  d: <FolderIcon weight="bold" className="text-brand" />,
  l: <LinkSimpleIcon weight="bold" className="text-tertiary" />,
  '-': <FileIcon weight="bold" className="text-tertiary" />,
};

const Breadcrumbs: FC<{
  path?: string;
  home?: string | null;
  onNavigate(path?: string): void;
}> = ({ path, home, onNavigate }) => {
  const current = path ?? home;
  return (
    <div className="flex flex-wrap items-center gap-1 mb-4">
      <BaseButton
        variant="tertiary"
        size="sm"
        onClick={() => onNavigate(undefined)}
        tooltip={translate('Home directory')}
        iconNode={<HouseIcon weight="bold" />}
      />
      {current &&
        getPathCrumbs(current).map((crumb, index, all) => (
          <Fragment key={crumb.path}>
            {index > 1 && <span className="text-quaternary">/</span>}
            {index === all.length - 1 ? (
              <span className="font-medium px-1">{crumb.label}</span>
            ) : (
              <BaseButton
                variant="text-primary"
                size="sm"
                onClick={() => onNavigate(crumb.path)}
                label={crumb.label}
              />
            )}
          </Fragment>
        ))}
    </div>
  );
};

export const HpcFilesTab: FC<{ resource: Resource }> = ({ resource }) => {
  const resourceUuid = resource.uuid;
  const { openDialog } = useModal();
  const { data: overview } = useHpcOverview(resourceUuid);
  const home = overview?.home_directory;
  // Unset means the user's home directory, which the backend resolves.
  const [path, setPath] = useState<string | undefined>();
  const [showHidden, setShowHidden] = useState(false);
  const currentPath = path ?? home ?? undefined;

  const filter = useMemo(
    () => ({ path, show_hidden: showHidden }),
    [path, showHidden],
  );
  const fetchData = useCallback(
    (request) =>
      hpcWorkspacesFilesList({
        path: { uuid: resourceUuid },
        query: {
          path: request.filter?.path || undefined,
          show_hidden: request.filter?.show_hidden,
        },
        signal: request.options?.signal,
      }).then((response) =>
        getInMemoryPage(sortDirectoryEntries(response.data), request),
      ),
    [resourceUuid],
  );
  const tableProps = useTable<HpcFile>({
    table: `hpc-files-${resourceUuid}`,
    fetchData,
    filter,
    meta: HPC_QUERY_OPTIONS.meta,
    retry: HPC_QUERY_OPTIONS.retry,
  });

  const open = useCallback(
    (file: HpcFile) => {
      if (!currentPath) return;
      const target = joinPath(currentPath, file.name);
      // A link usually points at a directory (scratch, project space); if it
      // does not, the listing reports why and the breadcrumbs lead back.
      if (file.type === 'd' || file.type === 'l') {
        setPath(target);
      } else {
        openDialog(HpcFileContentDialog, {
          resolve: { resourceUuid, path: target },
          size: 'xl',
        });
      }
    },
    [currentPath, openDialog, resourceUuid],
  );

  const plot = useCallback(
    (file: HpcFile) => {
      if (!currentPath) return;
      openDialog(HpcFileContentDialog, {
        resolve: {
          resourceUuid,
          path: joinPath(currentPath, file.name),
          tab: 'plot',
        },
        size: 'xl',
      });
    },
    [currentPath, openDialog, resourceUuid],
  );

  const columns = useMemo<Column<HpcFile>[]>(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => (
          <button
            type="button"
            className="text-btn flex items-center gap-2 text-start"
            onClick={() => open(row)}
            disabled={!currentPath}
          >
            {FILE_ICONS[row.type] ?? FILE_ICONS['-']}
            <span className={row.type === 'd' ? 'font-medium' : undefined}>
              {row.name}
            </span>
            {row.link_target && (
              <span className="text-tertiary text-xs">→ {row.link_target}</span>
            )}
          </button>
        ),
      },
      {
        title: translate('Size'),
        render: ({ row }) =>
          row.type === 'd' || !row.size
            ? renderFieldOrDash(null)
            : formatFilesize(Number(row.size), 'B'),
      },
      {
        title: translate('Permissions'),
        render: ({ row }) => <Code>{row.permissions}</Code>,
      },
      {
        title: translate('Owner'),
        render: ({ row }) =>
          renderFieldOrDash([row.user, row.group].filter(Boolean).join(':')),
      },
      {
        title: translate('Last modified'),
        render: ({ row }) => renderFieldOrDash(row.last_modified),
      },
    ],
    [open, currentPath],
  );

  return (
    <>
      <HpcErrorAlert error={tableProps.error} />
      <Table<HpcFile>
        {...tableProps}
        title={translate('Files')}
        subtitle={<Breadcrumbs path={path} home={home} onNavigate={setPath} />}
        verboseName={translate('files')}
        rowKey="name"
        cardBordered
        columns={columns}
        rowActions={({ row }) =>
          row.type === 'd' ? null : (
            <ActionsDropdown row={row} refetch={tableProps.fetch}>
              <ActionItem
                title={translate('View')}
                action={() => open(row)}
                iconNode={<EyeIcon weight="bold" />}
              />
              {isPlottableFile(row.name) && (
                <ActionItem
                  title={translate('Plot')}
                  action={() => plot(row)}
                  iconNode={<ChartLineIcon weight="bold" />}
                />
              )}
            </ActionsDropdown>
          )
        }
        tableActions={
          <div className="flex items-center gap-3">
            <Switch
              checked={showHidden}
              onCheckedChange={setShowHidden}
              label={translate('Show hidden')}
              size="sm"
            />
          </div>
        }
      />
    </>
  );
};
