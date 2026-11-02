import { FC } from 'react';
import { SystemLog } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

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
      <PropertyItem label={translate('Message')} value={row.message} hasCopy />
      <PropertyItem label={translate('Logger')} value={row.logger_name} />
      <PropertyItem
        label={translate('File location')}
        value={fileLocation}
        hideIfEmpty
      />
      {traceback && (
        <PropertyItem label={translate('Traceback')}>
          <pre
            className="text-quaternary text-xs mb-0"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {traceback}
          </pre>
        </PropertyItem>
      )}
      {otherContextKeys.map(([key, value]) => (
        <PropertyItem
          key={key}
          label={key}
          value={
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          }
        />
      ))}
      {!hasContext && (
        <PropertyItem
          label={translate('Context')}
          value={translate('No additional context available')}
        />
      )}
    </ExpandableContainer>
  );
};
