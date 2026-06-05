import { describe, expect, it } from 'vitest';

import { buildMemberNameMap } from './useRoomMemberNames';

const member = (matrix_user_id: string, user_full_name: string) =>
  ({ matrix_user_id, user_full_name }) as any;

describe('buildMemberNameMap', () => {
  it('merges members from every room into one matrix-id to full-name map', () => {
    const map = buildMemberNameMap([
      { data: [member('@alice:server', 'Alice Smith')] },
      { data: [member('@bob:server', 'Bob Jones')] },
    ]);
    expect(map.get('@alice:server')).toBe('Alice Smith');
    expect(map.get('@bob:server')).toBe('Bob Jones');
  });

  it('skips members without a Waldur full name', () => {
    const map = buildMemberNameMap([{ data: [member('@native:server', '')] }]);
    expect(map.has('@native:server')).toBe(false);
  });

  it('tolerates rooms whose member query has not resolved yet', () => {
    const map = buildMemberNameMap([
      { data: undefined },
      { data: [member('@alice:server', 'Alice Smith')] },
    ]);
    expect(map.get('@alice:server')).toBe('Alice Smith');
  });
});
