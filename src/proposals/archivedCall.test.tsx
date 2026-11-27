import { renderHook } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';

import {
  ArchivedCallContext,
  getArchivedCallReason,
  isAwardStageStep,
  isCallArchived,
  isRowOfArchivedCall,
  useArchivedCallReason,
} from './archivedCall';

describe('isCallArchived', () => {
  it('is true for an archived call only', () => {
    expect(isCallArchived({ state: 'archived' })).toBe(true);
    expect(isCallArchived({ state: 'active' })).toBe(false);
    expect(isCallArchived({ state: 'draft' })).toBe(false);
  });

  it('is false while the call is not known yet', () => {
    expect(isCallArchived(undefined)).toBe(false);
    expect(isCallArchived(null)).toBe(false);
  });
});

describe('isAwardStageStep', () => {
  it('is a step of an extension or of the closing, or the award response', () => {
    expect(isAwardStageStep({ phase: 'extension' })).toBe(true);
    expect(isAwardStageStep({ phase: 'closing' })).toBe(true);
    expect(
      isAwardStageStep({ phase: 'evaluation', step: 'award_response' }),
    ).toBe(true);
    expect(isAwardStageStep({ key: 'award_response' })).toBe(true);
    expect(
      isAwardStageStep({ phase: 'evaluation', step: 'allocation_decision' }),
    ).toBe(false);
    expect(isAwardStageStep(undefined)).toBe(false);
  });
});

describe('isRowOfArchivedCall', () => {
  it("reads the row's call_state", () => {
    expect(isRowOfArchivedCall({ call_state: 'archived' })).toBe(true);
    expect(isRowOfArchivedCall({ call_state: 'active' })).toBe(false);
  });

  it('counts a row without it as not archived', () => {
    expect(isRowOfArchivedCall({ uuid: 'p1' })).toBe(false);
    expect(isRowOfArchivedCall(undefined)).toBe(false);
  });
});

describe('useArchivedCallReason', () => {
  const inCall =
    (archived: boolean): FC<PropsWithChildren> =>
    ({ children }) => (
      <ArchivedCallContext.Provider value={archived}>
        {children}
      </ArchivedCallContext.Provider>
    );

  it('gives the reason on a proposal of an archived call', () => {
    const { result } = renderHook(useArchivedCallReason, {
      wrapper: inCall(true),
    });
    expect(result.current).toBe(getArchivedCallReason());
  });

  it('gives nothing for an award-stage step, which goes on', () => {
    const { result } = renderHook(
      () => useArchivedCallReason({ phase: 'closing' }),
      { wrapper: inCall(true) },
    );
    expect(result.current).toBeUndefined();
  });

  it('gives nothing otherwise', () => {
    expect(
      renderHook(useArchivedCallReason, { wrapper: inCall(false) }).result
        .current,
    ).toBeUndefined();
    expect(renderHook(useArchivedCallReason).result.current).toBeUndefined();
  });
});
