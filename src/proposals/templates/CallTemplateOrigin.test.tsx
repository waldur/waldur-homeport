import { describe, expect, it } from 'vitest';

import { originLabel } from './CallTemplateOrigin';

const origin = {
  organization: 'EuroHPC Joint Undertaking',
  process: 'Regular Access',
  reference_url: null,
  programme: null,
};

describe('originLabel', () => {
  it('names the programme of a process', () => {
    expect(
      originLabel({ ...origin, programme: 'EuroHPC JU access calls' }),
    ).toBe('Regular Access — EuroHPC JU access calls');
  });

  it('names the organisation of a process of no programme', () => {
    expect(originLabel(origin)).toBe(
      'Regular Access — EuroHPC Joint Undertaking',
    );
  });

  it('names only the process of a generic pattern', () => {
    expect(
      originLabel({ ...origin, organization: '', process: 'Rapid access' }),
    ).toBe('Rapid access');
  });
});
