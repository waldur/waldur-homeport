import { DiffEditor } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VersionHistory } from 'waldur-js-client';

import { SegmentedControl, SegmentedControlOption } from 'waldur-ui';

import { initMonaco } from '@/form/monacoSetup';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { LoadingSpinner } from '@/table/TableRefreshButton';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { FieldDiff, HistoryEntityType } from './types';
import { computeFieldDiffs, formatFieldValue, serializeForDiff } from './utils';

interface VersionDiffViewerProps {
  entityType: HistoryEntityType;
  currentVersion: VersionHistory | null;
  previousVersion: VersionHistory | null;
  /** Extra controls for the header, beside the view switch. */
  actions?: ReactNode;
}

type ViewMode = 'table' | 'json';

export const VersionDiffViewer: FunctionComponent<VersionDiffViewerProps> = ({
  entityType,
  currentVersion,
  previousVersion,
  actions,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isMonacoReady, setIsMonacoReady] = useState(false);

  useEffect(() => {
    initMonaco().then(() => setIsMonacoReady(true));
  }, []);

  const diffs = useMemo(() => {
    if (!currentVersion) return [];
    return computeFieldDiffs(
      entityType,
      previousVersion?.serialized_data || null,
      currentVersion.serialized_data,
    );
  }, [entityType, currentVersion, previousVersion]);

  const changedCount = useMemo(
    () => diffs.filter((d) => d.changed).length,
    [diffs],
  );

  const tableId = `${currentVersion?.id}-${previousVersion?.id ?? 'none'}`;

  const viewModeOptions: SegmentedControlOption<ViewMode>[] = useMemo(
    () => [
      { value: 'table', label: translate('Table') },
      { value: 'json', label: translate('JSON') },
    ],
    [],
  );

  // Nothing to compare while loading or when there is no history; the
  // revisions pane says which.
  if (!currentVersion) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-2.5 min-h-13 px-6 py-3 border-b border-b-secondary">
        <div className="flex items-center whitespace-nowrap text-sm font-medium">
          {translate('Changes ({count})', { count: changedCount })}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {actions}
          <SegmentedControl<ViewMode>
            aria-label={translate('Diff view')}
            size="sm"
            options={viewModeOptions}
            value={viewMode}
            onValueChange={setViewMode}
          />
        </div>
      </div>

      <div className="grow overflow-auto">
        <div
          className="[--table-edge-px:--spacing(6)] [&_[data-slot=card-content]]:[--card-content-px:0px] [&_.overflow-x-auto]:border-0 [&_.overflow-x-auto]:rounded-none"
          style={{ display: viewMode === 'table' ? undefined : 'none' }}
        >
          <TableDiffView key={tableId} tableId={tableId} diffs={diffs} />
        </div>
        {isMonacoReady ? (
          <div
            className="h-full"
            style={{ display: viewMode === 'json' ? undefined : 'none' }}
          >
            <JsonDiffView
              currentVersion={currentVersion}
              previousVersion={previousVersion}
            />
          </div>
        ) : (
          viewMode === 'json' && (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          )
        )}
      </div>
    </div>
  );
};

const renderDiffValue = (value: unknown) =>
  value !== null && typeof value === 'object' ? (
    <pre className="mb-0 text-xs whitespace-pre-wrap wrap-anywhere">
      {formatFieldValue(value)}
    </pre>
  ) : (
    formatFieldValue(value)
  );

const diffColumns: Column<FieldDiff>[] = [
  {
    title: translate('Field'),
    render: ({ row }) => <>{row.label}</>,
  },
  {
    title: translate('Previous'),
    render: ({ row }) => <>{renderDiffValue(row.oldValue)}</>,
  },
  {
    title: translate('Current'),
    render: ({ row }) => <>{renderDiffValue(row.newValue)}</>,
  },
];

const TableDiffView: FunctionComponent<{
  tableId: string;
  diffs: FieldDiff[];
}> = ({ tableId, diffs }) => {
  const tableProps = useTable<FieldDiff>({
    table: `version-diff-${tableId}`,
    fetchData: () =>
      Promise.resolve({ rows: diffs, resultCount: diffs.length }),
  });

  return (
    <Table<FieldDiff>
      {...tableProps}
      columns={diffColumns}
      verboseName={translate('fields')}
      rowKey="field"
      hasPagination={false}
      hideTitle
      hasActionBar={false}
      hoverShadow={false}
      // The pane is the table's frame: no card and no dialog-table border.
      cardBordered={false}
      placeholderHasRetry={false}
      minHeight="auto"
    />
  );
};

const JsonDiffView: FunctionComponent<{
  currentVersion: VersionHistory;
  previousVersion: VersionHistory | null;
}> = ({ currentVersion, previousVersion }) => {
  const editorRef = useRef<monacoEditor.editor.IDiffEditor | null>(null);

  const originalJson = useMemo(
    () =>
      previousVersion
        ? serializeForDiff(previousVersion.serialized_data)
        : '{}',
    [previousVersion],
  );

  const modifiedJson = useMemo(
    () => serializeForDiff(currentVersion.serialized_data),
    [currentVersion],
  );

  useEffect(() => {
    return () => {
      // keepCurrentOriginalModel/keepCurrentModifiedModel stop
      // @monaco-editor/react from disposing the models, so they are disposed
      // here. On unmount React runs this (parent) cleanup before the
      // DiffEditor's own, while the widget still holds the models: detach
      // them first, or Monaco throws "TextModel got disposed before
      // DiffEditorWidget model got reset".
      const editor = editorRef.current;
      const model = editor?.getModel();
      editor?.setModel(null);
      model?.original?.dispose();
      model?.modified?.dispose();
      editorRef.current = null;
    };
  }, []);

  const handleMount = (editor: monacoEditor.editor.IDiffEditor) => {
    editorRef.current = editor;
  };

  return (
    <DiffEditor
      height="100%"
      language="json"
      original={originalJson}
      modified={modifiedJson}
      theme="vs-dark"
      onMount={handleMount}
      keepCurrentOriginalModel={true}
      keepCurrentModifiedModel={true}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderSideBySide: true,
        originalEditable: false,
        automaticLayout: true,
      }}
    />
  );
};
