import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixRoomsList, projectsRetrieve } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { hasActiveProjectMatrixRoomInCache } from '@/matrix/chat/useProjectMatrixRooms';

import { loadProject } from './resolve';

vi.mock('@/customer/utils', () => ({
  getCustomer: vi.fn(() => Promise.resolve({ uuid: 'c' })),
}));

vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));

vi.mock('@/store/store', () => ({ default: { dispatch: vi.fn() } }));

describe('loadProject', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(projectsRetrieve).mockResolvedValue({
      data: { uuid: 'project-uuid', customer_uuid: 'c' },
    } as any);
    vi.mocked(matrixRoomsList).mockResolvedValue({
      data: [{ uuid: 'room-uuid', state: 'active' }],
    } as any);
  });

  afterEach(() => {
    queryClient.clear();
    vi.useRealTimers();
  });

  it('keeps the primed chat rooms readable after the default GC window', async () => {
    await loadProject({ params: () => ({ uuid: 'project-uuid' }) } as any);
    expect(hasActiveProjectMatrixRoomInCache('project-uuid')).toBe(true);

    await vi.advanceTimersByTimeAsync(6 * 60 * 1000);

    expect(hasActiveProjectMatrixRoomInCache('project-uuid')).toBe(true);
  });
});
