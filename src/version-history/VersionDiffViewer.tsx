import { DiffEditor, loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Nav, Table } from 'react-bootstrap';
import { VersionHistory } from 'waldur-js-client';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { LoadingSpinner } from '@waldur/table/TableRefreshButton';

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
    loader.config({ monaco: monacoEditor });
    loader.init().then(() => {
      setIsMonacoReady(true);
    });
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

  if (!currentVersion) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-muted fs-6">
        {translate('Select a version to view details')}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom">
        <div className="d-flex align-items-center">
          <span className="fw-bold me-2">{translate('Changes')}:</span>
          <StateIndicator
            label={`${changedCount} ${translate('field(s) changed')}`}
            variant={changedCount > 0 ? 'warning' : 'secondary'}
            outline
          />
        </div>
        <Nav variant="pills" className="nav-pills-sm">
          <Nav.Item>
            <Nav.Link
              active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              className="cursor-pointer"
            >
              {translate('Table')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={viewMode === 'json'}
              onClick={() => setViewMode('json')}
              className="cursor-pointer"
            >
              {translate('JSON')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {viewMode === 'table' ? (
          <TableDiffView diffs={diffs} />
        ) : isMonacoReady ? (
          <JsonDiffView
            currentVersion={currentVersion}
            previousVersion={previousVersion}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <LoadingSpinner />
          </div>
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
      <div className="text-center text-muted py-10 fs-6">
        {translate('No fields to display')}
      </div>
    );
  }

  return (
    <Table responsive className="table-row-bordered align-middle mb-0">
      <thead>
        <tr className="fw-bold fs-7 text-uppercase text-muted">
          <th className="ps-5 min-w-150px">{translate('Field')}</th>
          <th className="min-w-200px">{translate('Previous')}</th>
          <th className="min-w-200px">{translate('Current')}</th>
        </tr>
      </thead>
      <tbody>
        {diffs.map((diff) => (
          <tr
            key={diff.field}
            className={diff.changed ? 'bg-light-warning' : ''}
          >
            <td className="ps-5 fw-semibold">{diff.label}</td>
            <td>
              <pre className="mb-0 fs-7 text-muted text-wrap bg-transparent">
                {formatFieldValue(diff.oldValue)}
              </pre>
            </td>
            <td>
              <pre className="mb-0 fs-7 text-wrap bg-transparent">
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

  return (
    <DiffEditor
      height="100%"
      language="json"
      original={originalJson}
      modified={modifiedJson}
      theme="vs-dark"
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
