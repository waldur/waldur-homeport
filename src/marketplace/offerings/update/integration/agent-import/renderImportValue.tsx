import { ReactNode } from 'react';

import { Code } from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/**
 * A value as the import preview sends it: a block or a list as JSON, a
 * switch as true/false, an unset one as a dash and an empty text as "".
 */
export const renderImportValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined) {
    return renderFieldOrDash(value);
  }
  // Set, to nothing: distinct from unset.
  if (value === '') {
    return <Code title={translate('Empty text')}>""</Code>;
  }
  if (typeof value === 'object' || typeof value === 'boolean') {
    return <Code className="break-all">{JSON.stringify(value)}</Code>;
  }
  return String(value);
};
