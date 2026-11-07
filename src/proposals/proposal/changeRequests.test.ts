import { describe, expect, it } from 'vitest';

import {
  anyFieldUnlocked,
  changeRequestPartLabel,
  getOpenChangeRequests,
  getStepChangeRequest,
  isPartEditable,
} from './changeRequests';

const request = {
  uuid: 'request',
  step_uuid: 'panel-step',
  unlocked_parts: ['field:project_summary', 'documents'],
} as any;

const other = {
  uuid: 'other',
  step_uuid: 'technical-step',
  unlocked_parts: ['resources', 'documents'],
} as any;

describe('change request helpers', () => {
  it('leaves every part of a draft editable', () => {
    expect(isPartEditable({ state: 'draft' } as any, 'team')).toBe(true);
  });

  it('opens only the unlocked parts of a proposal sent back', () => {
    const proposal = {
      state: 'in_review',
      open_change_requests: [request],
    } as any;
    expect(getOpenChangeRequests(proposal)).toEqual([request]);
    expect(isPartEditable(proposal, 'documents')).toBe(true);
    expect(isPartEditable(proposal, 'field:project_summary')).toBe(true);
    expect(isPartEditable(proposal, 'field:name')).toBe(false);
    expect(isPartEditable(proposal, 'resources')).toBe(false);
    expect(anyFieldUnlocked([request])).toBe(true);
  });

  it('opens every part any of several open requests unlocks', () => {
    const proposal = {
      state: 'in_review',
      open_change_requests: [request, other],
    } as any;
    expect(isPartEditable(proposal, 'field:project_summary')).toBe(true);
    expect(isPartEditable(proposal, 'resources')).toBe(true);
    expect(isPartEditable(proposal, 'team')).toBe(false);
    expect(anyFieldUnlocked([other])).toBe(false);
    expect(anyFieldUnlocked([other, request])).toBe(true);
  });

  it('finds the request a step made', () => {
    const proposal = {
      state: 'in_review',
      open_change_requests: [request, other],
    } as any;
    expect(getStepChangeRequest(proposal, { uuid: 'technical-step' })).toBe(
      other,
    );
    expect(getStepChangeRequest(proposal, { uuid: 'decision-step' })).toBe(
      null,
    );
  });

  it('locks a submitted proposal without a request', () => {
    const proposal = { state: 'in_review', open_change_requests: [] } as any;
    expect(getOpenChangeRequests(proposal)).toEqual([]);
    expect(isPartEditable(proposal, 'documents')).toBe(false);
  });

  it('ignores a request once the proposal left review', () => {
    const proposal = {
      state: 'rejected',
      open_change_requests: [request],
    } as any;
    expect(getOpenChangeRequests(proposal)).toEqual([]);
    expect(isPartEditable(proposal, 'documents')).toBe(false);
  });

  it('names the parts', () => {
    expect(changeRequestPartLabel('field:project_summary')).toBe('Summary');
    expect(changeRequestPartLabel('team')).toBe('Project team');
  });
});
