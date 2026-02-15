import { FC } from 'react';
import { SystemLog } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

interface SupportSystemLogsExpandableRowProps {
  row: SystemLog;
}

export const SupportSystemLogsExpandableRow: FC<
  SupportSystemLogsExpandableRowProps
> = ({ row }) => {
  const context = row.context as Record<string, unknown> | null;

  const traceback = context?.traceback as string | undefined;
  const pathname = context?.pathname as string | undefined;
  const lineno = context?.lineno;
  const funcName = context?.funcName as string | undefined;

  const otherContextKeys = context
    ? Object.entries(context).filter(
        ([key]) =>
          !['traceback', 'pathname', 'lineno', 'funcName'].includes(key),
      )
    : [];

  const hasFileLocation = pathname || lineno || funcName;
  const hasContext =
    traceback || hasFileLocation || otherContextKeys.length > 0;

  const fileLocation = hasFileLocation
    ? `${pathname || ''}${lineno != null ? `:${lineno}` : ''}${funcName ? ` in ${funcName}()` : ''}`
    : null;

  return (
    <ExpandableContainer asTable>
      <Field label={translate('Message')} value={row.message} hasCopy />
      <Field label={translate('Logger')} value={row.logger_name} />
      {fileLocation && (
        <Field label={translate('File location')} value={fileLocation} />
      )}
      {traceback && (
        <Field label={translate('Traceback')}>
          <pre
            className="text-gray-500 fs-7 mb-0"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {traceback}
          </pre>
        </Field>
      )}
      {otherContextKeys.map(([key, value]) => (
        <Field
          key={key}
          label={key}
          value={
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          }
        />
      ))}
      {!hasContext && (
        <Field
          label={translate('Context')}
          value={translate('No additional context available')}
        />
      )}
    </ExpandableContainer>
  );
};
