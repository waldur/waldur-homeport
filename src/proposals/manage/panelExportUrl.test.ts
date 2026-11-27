import { describe, expect, it } from 'vitest';

import { buildPanelExportUrl, panelExportFileName } from './panelExportUrl';

const call = {
  url: 'https://example.com/api/proposal-protected-calls/abc/',
  slug: 'eurohpc-ra',
  uuid: 'abc',
};

describe('buildPanelExportUrl', () => {
  it('appends the action to the call URL', () => {
    expect(buildPanelExportUrl(call, 'export-evaluations', 'csv')).toBe(
      'https://example.com/api/proposal-protected-calls/abc/export-evaluations/',
    );
  });

  it('asks for the workbook by file_format', () => {
    expect(buildPanelExportUrl(call, 'export-panel-sheet', 'xlsx')).toBe(
      'https://example.com/api/proposal-protected-calls/abc/export-panel-sheet/?file_format=xlsx',
    );
  });

  it('carries the panel, round and step filters through', () => {
    const url = buildPanelExportUrl(call, 'export-evaluations', 'csv', {
      panel_uuid: 'p1',
      round_uuid: 'r1',
      call_step_uuid: 's1',
    });
    expect(url).toContain('panel_uuid=p1');
    expect(url).toContain('round_uuid=r1');
    expect(url).toContain('call_step_uuid=s1');
  });

  it('leaves empty filters out', () => {
    expect(
      buildPanelExportUrl(call, 'export-panel-sheet', 'csv', {
        panel_uuid: 'p1',
        round_uuid: undefined,
      }),
    ).toBe(
      'https://example.com/api/proposal-protected-calls/abc/export-panel-sheet/?panel_uuid=p1',
    );
  });
});

describe('panelExportFileName', () => {
  it('names a panel sheet after the call and the panel', () => {
    expect(
      panelExportFileName(call, 'export-panel-sheet', 'xlsx', {
        key: 'physics',
        uuid: 'p1',
      }),
    ).toBe('eurohpc-ra-physics-panel-sheet.xlsx');
  });

  it('names the workbook of every panel', () => {
    expect(panelExportFileName(call, 'export-panel-sheet', 'xlsx')).toBe(
      'eurohpc-ra-panel-sheets.xlsx',
    );
  });

  it('names the evaluations export', () => {
    expect(panelExportFileName(call, 'export-evaluations', 'csv')).toBe(
      'eurohpc-ra-evaluations.csv',
    );
  });
});
