import { Call } from '../types';

export type PanelExportAction = 'export-evaluations' | 'export-panel-sheet';

export type ExportFileFormat = 'csv' | 'xlsx';

export interface PanelExportFilter {
  /** One panel's proposals. A panel's chair and members must name theirs. */
  panel_uuid?: string;
  round_uuid?: string;
  /** One step of the call's workflow; the evaluations export only. */
  call_step_uuid?: string;
  /** One proposal; the evaluations export only. */
  proposal_uuid?: string;
}

const FILTERS = [
  'panel_uuid',
  'round_uuid',
  'call_step_uuid',
  'proposal_uuid',
] as const;

/**
 * The URL of a call's evaluations export or panel sheet. Written by the
 * server: it holds every contribution to the call's steps, or one row per
 * proposal of a panel, with a column per form question or per step. A panel
 * sheet without a panel is one Excel workbook with a sheet per panel.
 */
export const buildPanelExportUrl = (
  call: Pick<Call, 'url'>,
  action: PanelExportAction,
  fileFormat: ExportFileFormat,
  filter?: PanelExportFilter,
): string => {
  const query = new URLSearchParams();
  FILTERS.filter((key) => filter?.[key]).forEach((key) =>
    query.set(key, filter[key]),
  );
  // csv is the endpoint's default; say so only for the workbook.
  if (fileFormat === 'xlsx') {
    query.set('file_format', 'xlsx');
  }
  const queryString = query.toString();
  return `${call.url}${action}/${queryString ? `?${queryString}` : ''}`;
};

/** The name the downloaded file is saved under, as the server names it. */
export const panelExportFileName = (
  call: Pick<Call, 'slug' | 'uuid'>,
  action: PanelExportAction,
  fileFormat: ExportFileFormat,
  panel?: { key?: string; uuid: string },
): string => {
  const parts = [call.slug || call.uuid];
  if (panel) {
    parts.push(panel.key || panel.uuid);
  }
  parts.push(
    action === 'export-evaluations'
      ? 'evaluations'
      : panel
        ? 'panel-sheet'
        : 'panel-sheets',
  );
  return `${parts.join('-')}.${fileFormat}`;
};
