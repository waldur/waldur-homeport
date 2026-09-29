import { dump, load } from 'js-yaml';

import { translate } from '@/i18n';

// The largest request the packaged API ingress accepts (proxy-body-size in
// waldur-helm's ingress-api.yaml). A bigger import would be refused there, with
// a bare 413, before it reaches the backend.
export const MAX_CALL_EXPORT_SIZE = 10 * 1024 * 1024;

/**
 * Renders a call export document as YAML. Key order is kept as the backend
 * produced it, so the file reads top-down the way the call is configured.
 */
export const renderCallExportYaml = (exportData: unknown): string =>
  dump(exportData, { noRefs: true, lineWidth: -1, sortKeys: false });

export const callExportFileName = (callName: string): string =>
  `${(callName || 'call').replace(/[\\/:*?"<>|]+/g, '-')}-export.yaml`;

/**
 * Parses an uploaded call export (YAML or JSON — JSON is valid YAML) and checks
 * it is shaped like one. Throws an Error with a user-facing message otherwise.
 */
export const parseCallExport = (content: string): Record<string, unknown> => {
  let parsed: unknown;
  try {
    parsed = load(content);
  } catch {
    throw new Error(translate('The file is not valid YAML or JSON.'));
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    !('schema_version' in parsed) ||
    !('call' in parsed)
  ) {
    throw new Error(translate('The file is not a call export.'));
  }
  return parsed as Record<string, unknown>;
};
