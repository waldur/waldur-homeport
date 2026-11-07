import { describe, expect, it } from 'vitest';

import { panelRequestBody } from './CallPanelFormDialog';
import { formatPanelDomains } from './utils';

describe('formatPanelDomains', () => {
  it('lists domains, then sub-domains, by code and name', () => {
    expect(
      formatPanelDomains({
        science_domain_details: [{ uuid: 'a', code: '1', name: 'Physics' }],
        science_sub_domain_details: [
          { uuid: 'b', code: '2.3', name: 'Materials' },
          { uuid: 'c', code: '', name: 'Uncoded' },
        ],
      }),
    ).toBe('1 Physics, 2.3 Materials, Uncoded');
  });

  it('is empty for a panel covering nothing', () => {
    expect(
      formatPanelDomains({
        science_domain_details: [],
        science_sub_domain_details: [],
      }),
    ).toBe('');
  });
});

describe('panelRequestBody', () => {
  const values = {
    name: '  Physics ',
    description: '',
    order: 2,
    science_domains: ['d1'],
    science_sub_domains: [],
    members: ['u1', 'u2'],
    chair: 'u1',
  };

  it('sends the chair when it is a member', () => {
    expect(panelRequestBody(values)).toEqual({
      name: 'Physics',
      description: '',
      order: 2,
      science_domains: ['d1'],
      science_sub_domains: [],
      members: ['u1', 'u2'],
      chair: 'u1',
    });
  });

  it('drops a chair taken off the members', () => {
    expect(panelRequestBody({ ...values, members: ['u2'] }).chair).toBeNull();
  });
});
