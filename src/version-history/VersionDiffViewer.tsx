import { DiffEditor } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'react-bootstrap';
import { VersionHistory } from 'waldur-js-client';

import { SegmentedControl, SegmentedControlOption } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { initMonaco } from '@/form/monacoSetup';
import { translate } from '@/i18n';
import { LoadingSpinner } from '@/table/TableRefreshButton';

import { HistoryEntityType } from './types';
import { computeFieldDiffs, formatFieldValue, serializeForDiff } from './utils';

interface VersionDiffViewerProps {
  entityType: HistoryEntityType;
  currentVersion: VersionHistory | null;
  previousVersion: VersionHistory | null;
}

type ViewMode = 'table' | 'json';

export const VersionDiffViewer: FunctionComponent<VersionDiffViewerProps> = ({
  entityType,
  currentVersion,
  previousVersion,
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

  const viewModeOptions: SegmentedControlOption<ViewMode>[] = useMemo(
    () => [
      { value: 'table', label: translate('Table') },
      { value: 'json', label: translate('JSON') },
    ],
    [],
  );

  if (!currentVersion) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-quaternary fs-6">
        {translate('Select a version to view details')}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 px-5 py-4 border-b-[1px] border-b-secondary">
        <div className="d-flex align-items-center text-nowrap">
          <span className="font-medium me-2">{translate('Changes')}:</span>
          <StateIndicator
            label={`${changedCount} ${translate('field(s) changed')}`}
            variant={changedCount > 0 ? 'warning' : 'secondary'}
            tone="outline"
          />
        </div>
        <SegmentedControl<ViewMode>
          aria-label={translate('Diff view')}
          size="sm"
          options={viewModeOptions}
          value={viewMode}
          onValueChange={setViewMode}
        />
      </div>

      <div className="flex-grow-1 overflow-auto">
        <div style={{ display: viewMode === 'table' ? undefined : 'none' }}>
          <TableDiffView diffs={diffs} />
        </div>
        {isMonacoReady ? (
          <div
            style={{
              display: viewMode === 'json' ? undefined : 'none',
              height: '100%',
            }}
          >
            <JsonDiffView
              currentVersion={currentVersion}
              previousVersion={previousVersion}
            />
          </div>
        ) : (
          viewMode === 'json' && (
            <div className="d-flex justify-content-center align-items-center h-100">
              <LoadingSpinner />
            </div>
          )
        )}
      </div>
    </div>
  );
};

const TableDiffView: FunctionComponent<{
  diffs: ReturnType<typeof computeFieldDiffs>;
}> = ({ diffs }) => {
  if (diffs.length === 0) {
    return (
      <div className="text-center text-quaternary py-10 fs-6">
        {translate('No fields to display')}
      </div>
    );
  }

  return (
    // The column minimums apply from md up: on a phone the three columns
    // share the width, and long values (emails, UUIDs) break instead.
    <Table responsive className="table-row-bordered align-middle mb-0">
      <thead>
        <tr className="font-medium fs-7 text-uppercase text-quaternary">
          <th className="ps-5 md:min-w-[150px]">{translate('Field')}</th>
          <th className="md:min-w-[200px]">{translate('Previous')}</th>
          <th className="md:min-w-[200px]">{translate('Current')}</th>
        </tr>
      </thead>
      <tbody>
        {diffs.map((diff) => (
          <tr
            key={diff.field}
            className={diff.changed ? 'bg-warning-subtle' : ''}
          >
            <td className="ps-5">{diff.label}</td>
            <td>
              <pre className="mb-0 fs-7 text-quaternary text-wrap text-break bg-transparent">
                {formatFieldValue(diff.oldValue)}
              </pre>
            </td>
            <td>
              <pre className="mb-0 fs-7 text-wrap text-break bg-transparent">
                {formatFieldValue(diff.newValue)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
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
