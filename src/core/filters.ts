import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change, destroy } from 'redux-form';

import { router } from '@waldur/router';

import { isEmpty } from './utils';

// Separator for compact uuid:name format
const COMPACT_SEPARATOR = '::';

/**
 * Compacts a filter value for URL storage.
 * For objects with uuid, stores as "uuid::name" string.
 * This keeps URLs shorter than JSON while preserving display names.
 */
const compactFilterValue = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(compactFilterValue);
  }
  if (typeof value === 'object' && value.uuid) {
    // Store as "uuid::name" or "uuid::title" for compact representation
    const label = value.name || value.title || '';
    return `${value.uuid}${COMPACT_SEPARATOR}${label}`;
  }
  return value;
};

// Pattern to detect compact "uuid::name" format
const COMPACT_UUID_PATTERN =
  /^([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})::(.*)$/i;

// Pattern to detect plain UUID (without name)
const PLAIN_UUID_PATTERN =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/**
 * Expands a compacted filter value from URL.
 * "uuid::name" strings are converted to {uuid, name} objects.
 * Plain UUID strings are converted to {uuid} objects.
 */
const expandFilterValue = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(expandFilterValue);
  }
  if (typeof value === 'string') {
    // Check for compact "uuid::name" format first
    const match = value.match(COMPACT_UUID_PATTERN);
    if (match) {
      const obj: any = { uuid: match[1] };
      if (match[2]) obj.name = match[2];
      return obj;
    }
    // Also handle plain UUIDs (without name) - will show UUID in badge
    if (PLAIN_UUID_PATTERN.test(value)) {
      return { uuid: value };
    }
  }
  return value;
};

const formatParam = (param: string) => {
  const decoded = (decodeURIComponent(param) as any).replaceAll('+', ' ');
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
};

export const getQueryParams = (): { [key: string]: any } => {
  const search = router.urlService.search();
  let urlParams = {};
  for (const [key, value] of Object.entries(search)) {
    const parsed = Array.isArray(value)
      ? value.map((v) => formatParam(v)).filter(Boolean)
      : formatParam(value);
    // Expand UUID strings back to {uuid: ...} objects
    urlParams = {
      ...urlParams,
      [key]: expandFilterValue(parsed),
    };
  }
  return urlParams;
};

// Refer to https://stackoverflow.com/a/41542008
export const syncFiltersToURL = (form: any) => {
  if (!form || isEmpty(form)) {
    return;
  }
  if ('URLSearchParams' in window) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(form)) {
      if (key && value) {
        // Compact the value to only store uuid for objects
        const compactedValue = compactFilterValue(value);
        // Store strings directly, JSON encode objects/arrays
        const encoded =
          typeof compactedValue === 'string'
            ? compactedValue
            : JSON.stringify(compactedValue);
        searchParams.set(key, encoded);
      }
      if (!value) {
        searchParams.delete(key);
      }
    }
    const serialized = searchParams.toString();
    const currentRouterPath = router.urlService.path();
    const newRelativePathQuery =
      currentRouterPath + (serialized ? '?' + serialized : '');
    router.urlService.url(newRelativePathQuery);
  }
};

export const getInitialValues = (initialValues?) => {
  const queryParams = getQueryParams();
  if (isEmpty(queryParams)) {
    return initialValues;
  }
  let queryParamValues = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (key && (Array.isArray(value) ? value.length : value)) {
      queryParamValues = {
        ...queryParamValues,
        [key]: value,
      };
    }
  }
  return queryParamValues;
};

/** When switching between pages, existing filters are removed from the URL, we need to restore them. */
export const useSyncInitialFiltersToURL = (initialValues) => {
  useEffect(() => {
    syncFiltersToURL(initialValues);
  }, []);
};

export const useReinitializeFilterFromUrl = (
  form: string,
  initialValues?: any,
  initializeFn: (urlInitialValues: any) => any = (v) => v,
) => {
  const dispatch = useDispatch();
  const { state } = useCurrentStateAndParams();

  // Re-initialize filters from URL on mount and when route changes

  useEffect(() => {
    const values = initializeFn(getInitialValues(initialValues));
    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        dispatch(change(form, key, value));
      });
    }
  }, [state?.name, form]);
};

export const useDestroyFilterOnLeave = (form: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(destroy(form));
    };
  });
};
