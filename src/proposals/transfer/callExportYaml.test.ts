import { describe, expect, it } from 'vitest';

import {
  callExportFileName,
  parseCallExport,
  renderCallExportYaml,
} from './callExportYaml';
import { getPresentSections, sectionFlags } from './sections';

const exportData = {
  schema_version: 1,
  call: { name: 'Spring call', description: 'Line one\nLine two' },
  rounds: [{ start_time: '2026-01-01T00:00:00+00:00' }],
  proposal_field_config: { field_description: 'required' },
};

describe('call export YAML', () => {
  it('round-trips through YAML without losing data or key order', () => {
    const yaml = renderCallExportYaml(exportData);
    expect(yaml.indexOf('schema_version')).toBeLessThan(yaml.indexOf('call:'));
    expect(parseCallExport(yaml)).toEqual(exportData);
  });

  it('accepts a JSON export', () => {
    expect(parseCallExport(JSON.stringify(exportData))).toEqual(exportData);
  });

  it('rejects malformed YAML', () => {
    expect(() => parseCallExport('call: [unclosed')).toThrow(
      'The file is not valid YAML or JSON.',
    );
  });

  it('rejects a document that is not a call export', () => {
    expect(() => parseCallExport('offering:\n  name: x\n')).toThrow(
      'The file is not a call export.',
    );
  });

  it('builds a safe file name from the call name', () => {
    expect(callExportFileName('HPC: 2026/Q1')).toBe('HPC- 2026-Q1-export.yaml');
  });
});

describe('call transfer sections', () => {
  it('lists only the sections a document carries', () => {
    expect(getPresentSections(exportData)).toEqual(['rounds', 'field_configs']);
  });

  it('leaves out sections that are present but empty', () => {
    expect(
      getPresentSections({
        ...exportData,
        rounds: [],
        documents: [],
        compliance_checklist: null,
        coi_configuration: null,
      }),
    ).toEqual(['field_configs']);
  });

  it('maps selections onto prefixed flags, unticked ones false', () => {
    const flags = sectionFlags('import_', { rounds: true });
    expect(flags.import_rounds).toBe(true);
    expect(flags.import_documents).toBe(false);
    expect(Object.keys(flags)).toHaveLength(8);
  });
});
