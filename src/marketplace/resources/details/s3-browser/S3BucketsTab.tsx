import {
  ArrowSquareInIcon,
  DownloadSimpleIcon,
  FileIcon,
  FolderIcon,
  TerminalWindowIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  marketplaceResourceApiKeysList,
  Offering,
  Resource,
  ResourceApiKeyStatus,
  S3BrowserInfo,
  S3Bucket,
  S3DeleteObjectsResult,
} from 'waldur-js-client';

import {
  Badge,
  BaseButton,
  Breadcrumb,
  LinkButton,
  NativeSelect,
  NoResult,
} from 'waldur-ui';

import { AddButton } from '@/core/AddButton';
import { formatDateTime } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { BucketDetailsRow } from './BucketDetailsRow';
import { CreateBucketDialog } from './CreateBucketDialog';
import { ObjectDetailsRow } from './ObjectDetailsRow';
import { S3ClientInstructionsDialog } from './S3ClientInstructionsDialog';
import {
  baseName,
  errorBody,
  prefixParts,
  refusedDeletes,
  S3Source,
  s3Source,
  usableKeys,
} from './s3Source';

interface Location {
  bucket?: string;
  prefix: string;
}

type EntryRow =
  | {
      kind: 'folder';
      key: string;
      size?: undefined;
      modified?: undefined;
      storageClass?: undefined;
    }
  | {
      kind: 'file';
      key: string;
      size: number;
      modified?: string | null;
      storageClass: string;
    };

/** A table over rows already in memory, sorted and paged on the client;
 * refreshed when the rows change (the fetcher closes over them). A page left
 * past the end, after a delete, falls back to the first. */
const useMemoryTable = <T,>(table: string, rows: T[]) => {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const tableProps = useTable<T>({
    table,
    fetchData: (request) =>
      createClientPaginatedFetcher(rowsRef.current)(request),
  });
  const { fetch } = tableProps;
  useEffect(() => {
    fetch();
  }, [rows, fetch]);
  return tableProps;
};

/** The user kept the existing file rather than replacing it. */
class UploadSkipped extends Error {}

const S3_EVENT_TYPES = [
  'marketplace_resource_s3_object_downloaded',
  'marketplace_resource_s3_storage_changed',
];

const errorText = (error: any) => {
  const body = errorBody(error);
  const detail = body?.detail ?? body?.code ?? error?.message;
  return typeof detail === 'string'
    ? detail
    : translate('The storage service did not answer.');
};

const bytes = (value?: number | null) =>
  value === null || value === undefined ? null : formatFilesize(value, 'B');

/** "4.2 GB of 5 GB account quota · 3 buckets · up to 1 GB each", from what the
 * site agent last published and the sizes just read. */
const QuotaFooter: FC<{ info?: S3BrowserInfo; buckets: S3Bucket[] }> = ({
  info,
  buckets,
}) => {
  if (!info) return null;
  const { total, per_bucket, scope } = info.quotas;
  const sizes = buckets.map((bucket) => bucket.size_bytes);
  const used = sizes.every((size) => size !== null)
    ? sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0)
    : null;
  const parts = [
    total?.max_size_bytes
      ? translate('{used} of {limit} {scope} quota', {
          used: renderFieldOrDash(bytes(used)),
          limit: bytes(total.max_size_bytes),
          scope: scope === 'account' ? translate('account') : translate('user'),
        })
      : used !== null
        ? translate('{used} stored, no storage quota', { used: bytes(used) })
        : null,
    total?.max_objects
      ? translate('at most {n} objects', { n: total.max_objects })
      : null,
    translate('Buckets: {n}', { n: buckets.length }),
    per_bucket?.max_size_bytes
      ? translate('up to {limit} per bucket', {
          limit: bytes(per_bucket.max_size_bytes),
        })
      : null,
  ].filter(Boolean);
  return (
    <div
      className="px-(--card-padding-x) py-3 border-t border-secondary text-sm text-tertiary"
      data-testid="s3-quota-footer"
    >
      {parts.join(' · ')}
    </div>
  );
};

/** An error in place of a table, with the key picker still above it: another
 * key may well work where this one did not. */
const WithKeyPicker: FC<{ keyPicker?: ReactNode; children: ReactNode }> = ({
  keyPicker,
  children,
}) => (
  <div className="flex flex-col gap-3">
    {keyPicker && <div className="flex justify-end">{keyPicker}</div>}
    {children}
  </div>
);

const KeyPicker: FC<{
  keys: ResourceApiKeyStatus[];
  value: string;
  onChange: (uuid: string) => void;
}> = ({ keys, value, onChange }) =>
  keys.length > 1 ? (
    <NativeSelect
      aria-label={translate('Browse with key')}
      size="lg"
      fit
      // A long key name would push the table's own actions off the header.
      containerClassName="max-w-60"
      className="w-full truncate"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {keys.map((key) => (
        <option key={key.uuid} value={key.uuid}>
          {translate('Key: {name}', {
            name: key.description || key.client_id,
          })}
        </option>
      ))}
    </NativeSelect>
  ) : null;

const BucketTable: FC<{
  source: S3Source;
  keyUuid: string;
  info?: S3BrowserInfo;
  keysTabHidden?: boolean;
  keyPicker?: ReactNode;
  resourceUrl: string;
  open: (bucket: string) => void;
}> = ({
  source,
  keyUuid,
  info,
  keysTabHidden,
  keyPicker,
  resourceUrl,
  open,
}) => {
  const { openDialog } = useModal();
  // What the browser recorded for this resource: downloads and every change.
  const activityFilter = useMemo(
    () => ({ scope: resourceUrl, event_type: S3_EVENT_TYPES }),
    [resourceUrl],
  );
  const query = useQuery({
    queryKey: ['s3-buckets', keyUuid],
    queryFn: () => source.buckets(),
  });
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const tableProps = useMemoryTable<S3Bucket>(`s3-buckets-${keyUuid}`, rows);
  const { mutate: remove } = useManagedMutation({
    mutationFn: (bucket: string) => source.deleteBucket(bucket),
    confirmation: {
      title: translate('Delete bucket'),
      body: (bucket: string) =>
        translate(
          'Delete bucket {bucket}? Only an empty bucket can be deleted.',
          { bucket },
        ),
    },
    successMessage: translate('Bucket deleted.'),
    errorMessage: translate(
      'Unable to delete the bucket. A bucket must be empty first.',
    ),
    refetch: () => query.refetch().then(() => undefined),
  });

  if (query.isError) {
    return (
      <WithKeyPicker keyPicker={keyPicker}>
        <NoResult
          title={translate('Unable to list buckets')}
          message={errorText(query.error)}
          buttonTitle={translate('Try again')}
          callback={() => query.refetch()}
        />
      </WithKeyPicker>
    );
  }
  // Columns a gateway's flavor cannot fill are left out, not shown as dashes.
  const capabilities = info?.capabilities;
  const stats = capabilities?.bucket_stats ?? false;
  const shown = (part: string) =>
    !capabilities || capabilities.bucket_parts.includes(part);
  const knowsAccess = shown('acl') || shown('policy_public');

  return (
    <Table<S3Bucket>
      {...tableProps}
      loading={query.isLoading || tableProps.loading}
      title={translate('Buckets')}
      verboseName={translate('buckets')}
      cardBordered
      emptyMessage={translate('This resource has no buckets yet.')}
      columns={[
        {
          title: translate('Name'),
          id: 'name',
          keys: ['name'],
          orderField: 'name',
          render: ({ row }) => (
            <LinkButton onClick={() => open(row.name)}>
              <FolderIcon weight="bold" className="me-2" />
              {row.name}
            </LinkButton>
          ),
        },
        stats && {
          title: translate('Objects'),
          id: 'objects',
          keys: ['objects'],
          orderField: 'objects',
          render: ({ row }) => renderFieldOrDash(row.objects),
        },
        stats && {
          title: translate('Size'),
          id: 'size',
          keys: ['size_bytes'],
          orderField: 'size_bytes',
          render: ({ row }) => {
            const limit = info?.quotas.per_bucket?.max_size_bytes;
            const size = bytes(row.size_bytes);
            if (!size) return renderFieldOrDash(null);
            return limit
              ? translate('{size} of {limit}', {
                  size,
                  limit: bytes(limit),
                })
              : size;
          },
        },
        knowsAccess && {
          title: translate('Access'),
          id: 'access',
          keys: ['is_public'],
          orderField: 'is_public',
          render: ({ row }) =>
            row.is_public === null ? (
              renderFieldOrDash(null)
            ) : row.is_public ? (
              <Badge variant="danger">{translate('Public')}</Badge>
            ) : (
              <Badge variant="neutral">{translate('Private')}</Badge>
            ),
        },
        shown('versioning') && {
          title: translate('Versioning'),
          id: 'versioning',
          keys: ['versioning'],
          orderField: 'versioning',
          render: ({ row }) =>
            row.versioning === 'Enabled' ? (
              <Badge variant="success">{translate('Enabled')}</Badge>
            ) : row.versioning === 'Suspended' ? (
              <Badge variant="warning">{translate('Suspended')}</Badge>
            ) : (
              renderFieldOrDash(row.versioning && translate('Disabled'))
            ),
        },
        {
          title: translate('Created'),
          id: 'created',
          keys: ['created'],
          orderField: 'created',
          render: ({ row }) =>
            renderFieldOrDash(row.created && formatDateTime(row.created)),
        },
      ]}
      hasOptionalColumns
      expandableRow={({ row }) => (
        <BucketDetailsRow
          source={source}
          keyUuid={keyUuid}
          bucket={row.name}
          capabilities={info?.capabilities}
        />
      )}
      footer={
        query.data ? <QuotaFooter info={info} buckets={query.data} /> : null
      }
      dropdownActions={
        <>
          {info && (
            <ActionItem
              title={translate('Use an S3 client')}
              iconNode={<TerminalWindowIcon weight="bold" />}
              action={() =>
                openDialog(S3ClientInstructionsDialog, {
                  resolve: { info, keysTabHidden },
                  size: 'lg',
                })
              }
            />
          )}
          <FilteredEventsButton
            filter={activityFilter}
            title={translate('Bucket activity')}
            asDropdownItem
          />
        </>
      }
      tableActions={
        <div className="flex flex-wrap items-center gap-2">
          {keyPicker}
          <AddButton
            onClick={() =>
              openDialog(CreateBucketDialog, {
                resolve: {
                  source,
                  onCreated: () => query.refetch(),
                },
              })
            }
          />
        </div>
      }
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch} size="sm">
          <ActionItem
            title={translate('Open')}
            iconNode={<ArrowSquareInIcon weight="bold" />}
            action={() => open(row.name)}
          />
          <ActionItem
            title={translate('Delete')}
            iconNode={<TrashIcon weight="bold" />}
            className="text-danger"
            action={() => remove(row.name)}
          />
        </ActionsDropdown>
      )}
    />
  );
};

const ObjectTable: FC<{
  source: S3Source;
  keyUuid: string;
  info?: S3BrowserInfo;
  keysTabHidden?: boolean;
  keyPicker?: ReactNode;
  bucket: string;
  prefix: string;
  openPrefix: (prefix: string) => void;
}> = ({
  source,
  keyUuid,
  info,
  keysTabHidden,
  keyPicker,
  bucket,
  prefix,
  openPrefix,
}) => {
  const { openDialog, confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const queryKey = useMemo(
    () => ['s3-objects', keyUuid, bucket, prefix],
    [keyUuid, bucket, prefix],
  );
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => source.list(bucket, prefix, pageParam),
    initialPageParam: '',
    getNextPageParam: (last) =>
      last.is_truncated ? last.next_continuation_token : undefined,
  });
  const rows = useMemo<EntryRow[]>(() => {
    const pages = query.data?.pages ?? [];
    return [
      ...pages.flatMap((page) =>
        page.folders.map((key) => ({ kind: 'folder' as const, key })),
      ),
      ...pages.flatMap((page) =>
        page.objects.map((object) => ({
          kind: 'file' as const,
          key: object.key,
          size: object.size,
          modified: object.modified,
          storageClass: object.storage_class,
        })),
      ),
    ];
  }, [query.data]);
  const tableProps = useMemoryTable<EntryRow>(
    `s3-objects-${keyUuid}-${bucket}-${prefix}`,
    rows,
  );
  const reload = () => queryClient.resetQueries({ queryKey });

  // A delete the gateway partly refused still removed the rest: refresh the
  // listing before reporting the refusal, or it keeps showing deleted files.
  const afterDelete = (result: S3DeleteObjectsResult) => {
    reload();
    return refusedDeletes(result);
  };
  const { mutate: removeFile } = useManagedMutation({
    mutationFn: (key: string) =>
      source.deleteObjects(bucket, [key]).then(afterDelete),
    confirmation: {
      title: translate('Delete file'),
      body: (key: string) =>
        translate('Delete {name}? This cannot be undone.', {
          name: baseName(key),
        }),
    },
    successMessage: translate('File deleted.'),
    errorMessage: translate('Unable to delete the file.'),
    refetch: reload,
  });
  const { mutate: removeFolder } = useManagedMutation({
    mutationFn: (folder: string) =>
      source.deleteFolder(bucket, folder).then(afterDelete),
    confirmation: {
      title: translate('Delete folder'),
      body: (folder: string) =>
        translate(
          'Delete folder {name} and every file in it? This cannot be undone.',
          { name: baseName(folder) },
        ),
    },
    successMessage: translate('Folder deleted.'),
    errorMessage: translate('Unable to delete the folder.'),
    refetch: reload,
  });
  const download = useMutation({
    mutationFn: (key: string) => source.download(bucket, key),
    onError: (error) =>
      showErrorResponse(error, translate('Unable to download the file.')),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const key = `${prefix}${file.name}`;
      try {
        return await source.upload(bucket, key, file);
      } catch (error: any) {
        if (errorBody(error)?.code !== 'ObjectExists') throw error;
        await confirm(
          translate('Replace file'),
          translate('{name} already exists here. Replace it?', {
            name: file.name,
          }),
          { forDeletion: true, positiveButton: translate('Replace') },
        ).catch(() => {
          throw new UploadSkipped();
        });
        return source.upload(bucket, key, file, true);
      }
    },
    onSuccess: (_, file) => {
      showSuccess(translate('{name} uploaded.', { name: file.name }));
      reload();
    },
    onError: (error) => {
      if (error instanceof UploadSkipped) return;
      showErrorResponse(error, translate('Unable to upload the file.'));
    },
  });

  const showClientInstructions = () =>
    info &&
    openDialog(S3ClientInstructionsDialog, {
      resolve: { info, bucket, prefix, keysTabHidden },
      size: 'lg',
    });

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const tooLarge = Array.from(files).filter(
      (file) => info && file.size > info.max_upload_size,
    );
    if (tooLarge.length) {
      showClientInstructions();
    }
    // One at a time: a file that already exists asks before it is replaced,
    // and only one such question can be on screen at once.
    const queue = Array.from(files).filter((file) => !tooLarge.includes(file));
    void (async () => {
      for (const file of queue) {
        await upload.mutateAsync(file).catch(() => undefined);
      }
    })();
  };

  if (query.isError) {
    return (
      <WithKeyPicker keyPicker={keyPicker}>
        <NoResult
          title={translate('Unable to list the bucket')}
          message={errorText(query.error)}
          buttonTitle={translate('Try again')}
          callback={() => query.refetch()}
        />
      </WithKeyPicker>
    );
  }
  return (
    <>
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        aria-hidden
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <Table<EntryRow>
        {...tableProps}
        loading={query.isLoading || tableProps.loading}
        title={bucket}
        verboseName={translate('files')}
        cardBordered
        emptyMessage={translate('This folder is empty.')}
        columns={[
          {
            title: translate('Name'),
            id: 'name',
            keys: ['key'],
            render: ({ row }) =>
              row.kind === 'folder' ? (
                <LinkButton onClick={() => openPrefix(row.key)}>
                  <FolderIcon weight="bold" className="me-2" />
                  {baseName(row.key)}
                </LinkButton>
              ) : (
                <span className="inline-flex items-center">
                  <FileIcon weight="bold" className="me-2 text-tertiary" />
                  {baseName(row.key)}
                </span>
              ),
          },
          {
            title: translate('Size'),
            id: 'size',
            keys: ['size'],
            render: ({ row }) =>
              renderFieldOrDash(
                row.kind === 'file' ? formatFilesize(row.size, 'B') : null,
              ),
          },
          {
            title: translate('Modified'),
            id: 'modified',
            keys: ['modified'],
            render: ({ row }) =>
              renderFieldOrDash(
                row.kind === 'file' && row.modified
                  ? formatDateTime(row.modified)
                  : null,
              ),
          },
          {
            title: translate('Storage class'),
            id: 'storage_class',
            keys: ['storageClass'],
            optional: true,
            render: ({ row }) =>
              renderFieldOrDash(row.kind === 'file' ? row.storageClass : null),
          },
        ]}
        hasOptionalColumns
        isRowExpandable={(row) => row.kind === 'file'}
        expandableRow={({ row }) => (
          <ObjectDetailsRow
            source={source}
            keyUuid={keyUuid}
            bucket={bucket}
            objectKey={row.key}
            capabilities={info?.capabilities}
          />
        )}
        tableActions={
          <div className="flex flex-wrap items-center gap-2">
            {keyPicker}
            <BaseButton
              variant="tertiary"
              size="md"
              label={translate('Use an S3 client')}
              iconNode={<TerminalWindowIcon weight="bold" />}
              disabled={!info}
              disabledReason={translate('Loading connection details')}
              onClick={showClientInstructions}
            />
            <BaseButton
              variant="primary"
              size="lg"
              label={translate('Upload')}
              iconNode={<UploadSimpleIcon weight="bold" />}
              pending={upload.isPending}
              tooltip={
                info
                  ? translate(
                      'Files up to {size}; larger ones need an S3 client.',
                      {
                        size: formatFilesize(info.max_upload_size, 'B'),
                      },
                    )
                  : undefined
              }
              onClick={() => fileInput.current?.click()}
            />
          </div>
        }
        rowActions={({ row }) => (
          <ActionsDropdown row={row} refetch={tableProps.fetch} size="sm">
            {row.kind === 'folder' ? (
              <>
                <ActionItem
                  title={translate('Open')}
                  iconNode={<ArrowSquareInIcon weight="bold" />}
                  action={() => openPrefix(row.key)}
                />
                <ActionItem
                  title={translate('Delete folder')}
                  iconNode={<TrashIcon weight="bold" />}
                  className="text-danger"
                  action={() => removeFolder(row.key)}
                />
              </>
            ) : (
              <>
                <ActionItem
                  title={translate('Download')}
                  iconNode={<DownloadSimpleIcon weight="bold" />}
                  action={() => download.mutate(row.key)}
                />
                <ActionItem
                  title={translate('Delete')}
                  iconNode={<TrashIcon weight="bold" />}
                  className="text-danger"
                  action={() => removeFile(row.key)}
                />
              </>
            )}
          </ActionsDropdown>
        )}
      />
      {query.hasNextPage && (
        <div className="flex justify-center mt-3">
          <BaseButton
            variant="tertiary"
            label={translate('Load more')}
            pending={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          />
        </div>
      )}
    </>
  );
};

/**
 * Browse and manage the resource's buckets through one of its API keys. The
 * server signs every call with the key's stored secret, so this works for
 * whoever may reveal the key and nobody else, and nothing here holds a secret.
 */
export const S3BucketsTab: FC<{ resource: Resource; offering?: Offering }> = ({
  resource,
  offering,
}) => {
  const user = useUser();
  const keysQuery = useQuery({
    queryKey: ['s3-browser-keys', resource.uuid],
    queryFn: () =>
      marketplaceResourceApiKeysList({
        query: { resource_uuid: resource.uuid, state: ['OK'] },
      }).then((response) => response.data),
  });
  const keys = useMemo(
    () => usableKeys(keysQuery.data ?? [], user?.uuid),
    [keysQuery.data, user?.uuid],
  );
  const keysTabHidden = Boolean(offering?.plugin_options?.hide_api_keys_tab);
  const [keyUuid, setKeyUuid] = useState<string>();
  const activeKey = keyUuid ?? keys[0]?.uuid;
  const [location, setLocation] = useState<Location>({ prefix: '' });
  const source = useMemo(
    () => (activeKey ? s3Source(activeKey) : undefined),
    [activeKey],
  );
  const infoQuery = useQuery({
    queryKey: ['s3-info', activeKey],
    queryFn: () => source!.info(),
    enabled: Boolean(source),
  });

  if (keysQuery.isLoading) {
    return null;
  }
  if (!activeKey || !source) {
    return (
      <NoResult
        title={translate('No API key to browse with')}
        message={translate(
          'Buckets are browsed with one of the resource’s API keys. This resource has no key that is ready yet.',
        )}
        noAction
      />
    );
  }
  const keyPicker = (
    <KeyPicker
      keys={keys}
      value={activeKey}
      onChange={(uuid) => {
        setKeyUuid(uuid);
        setLocation({ prefix: '' });
      }}
    />
  );
  if (infoQuery.isError) {
    return (
      <WithKeyPicker keyPicker={keyPicker}>
        <NoResult
          title={translate('Buckets cannot be browsed')}
          message={errorText(infoQuery.error)}
          buttonTitle={translate('Try again')}
          callback={() => infoQuery.refetch()}
        />
      </WithKeyPicker>
    );
  }

  const parts = prefixParts(location.prefix);
  return (
    <div className="flex flex-col gap-3">
      {location.bucket && (
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                asChild
                onClick={() => setLocation({ prefix: '' })}
              >
                <button type="button">{translate('Buckets')}</button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              {parts.length ? (
                <Breadcrumb.Link
                  asChild
                  onClick={() =>
                    setLocation({ bucket: location.bucket, prefix: '' })
                  }
                >
                  <button type="button">{location.bucket}</button>
                </Breadcrumb.Link>
              ) : (
                <Breadcrumb.Page>{location.bucket}</Breadcrumb.Page>
              )}
            </Breadcrumb.Item>
            {parts.map((part, index) => {
              const prefix = parts.slice(0, index + 1).join('/') + '/';
              const last = index === parts.length - 1;
              return (
                <span key={prefix} className="contents">
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    {last ? (
                      <Breadcrumb.Page>{part}</Breadcrumb.Page>
                    ) : (
                      <Breadcrumb.Link
                        asChild
                        onClick={() =>
                          setLocation({ bucket: location.bucket, prefix })
                        }
                      >
                        <button type="button">{part}</button>
                      </Breadcrumb.Link>
                    )}
                  </Breadcrumb.Item>
                </span>
              );
            })}
          </Breadcrumb.List>
        </Breadcrumb>
      )}
      {location.bucket ? (
        <ObjectTable
          source={source}
          keyUuid={activeKey}
          info={infoQuery.data}
          keysTabHidden={keysTabHidden}
          keyPicker={keyPicker}
          bucket={location.bucket}
          prefix={location.prefix}
          openPrefix={(prefix) =>
            setLocation({ bucket: location.bucket, prefix })
          }
        />
      ) : (
        <BucketTable
          source={source}
          keyUuid={activeKey}
          info={infoQuery.data}
          keysTabHidden={keysTabHidden}
          resourceUrl={resource.url}
          keyPicker={keyPicker}
          open={(bucket) => setLocation({ bucket, prefix: '' })}
        />
      )}
    </div>
  );
};
