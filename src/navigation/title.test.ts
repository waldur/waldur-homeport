import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        SHORT_PAGE_TITLE: 'TestApp',
      },
    },
  },
}));

import { reducer } from './title';

describe('Title reducer', () => {
  const SET_TITLE = 'waldur/navigation/SET_TITLE';

  beforeEach(() => {
    document.title = '';
  });

  it('should return default state', () => {
    const state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({ title: '', subtitle: '' });
  });

  it('should update state when as is "both"', () => {
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'both',
      },
    };
    const state = reducer(undefined, action);
    expect(state).toEqual({
      title: 'Dashboard',
      subtitle: 'Overview',
      as: 'both',
    });
  });

  it('should update state when as is "page"', () => {
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'page',
      },
    };
    const state = reducer(undefined, action);
    expect(state).toEqual({
      title: 'Dashboard',
      subtitle: 'Overview',
      as: 'page',
    });
  });

  it('should not update state when as is "browser"', () => {
    const initialState = { title: 'Old', subtitle: 'State' };
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'browser',
      },
    };
    const state = reducer(initialState, action);
    expect(state).toEqual({ title: 'Old', subtitle: 'State' });
  });

  it('should update document.title when as is "both"', () => {
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'both',
      },
    };
    reducer(undefined, action);
    expect(document.title).toBe('Dashboard | TestApp');
  });

  it('should update document.title when as is "browser"', () => {
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'browser',
      },
    };
    reducer(undefined, action);
    expect(document.title).toBe('Dashboard | TestApp');
  });

  it('should not update document.title when as is "page"', () => {
    document.title = 'Original Title';
    const action = {
      type: SET_TITLE,
      payload: {
        title: 'Dashboard',
        subtitle: 'Overview',
        as: 'page',
      },
    };
    reducer(undefined, action);
    expect(document.title).toBe('Original Title');
  });
});
