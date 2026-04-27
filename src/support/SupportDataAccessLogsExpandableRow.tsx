import { FC } from 'react';
import { GlobalUserDataAccessLog } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { formatFieldName } from '@/user/data-access/utils';

interface SupportDataAccessLogsExpandableRowProps {
  row: GlobalUserDataAccessLog;
}

export const SupportDataAccessLogsExpandableRow: FC<
  SupportDataAccessLogsExpandableRowProps
> = ({ row }) => {
  const context = row.context;

  return (
    <ExpandableContainer>
      <div className="d-flex flex-column gap-3">
        {/* Accessed fields */}
        <div>
          <strong>{translate('Accessed fields')}:</strong>
          <div className="d-flex flex-wrap gap-1 mt-1">
            {row.accessed_fields.map((field) => (
              <Badge key={field} variant="secondary" pill outline>
                {formatFieldName(field)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Context information */}
        {context && Object.keys(context).length > 0 && (
          <>
            {context.endpoint && (
              <div>
                <strong>{translate('Endpoint')}:</strong>{' '}
                <code className="text-muted">
                  {context.method && `${context.method} `}
                  {String(context.endpoint)}
                </code>
              </div>
            )}
            {Object.entries(context)
              .filter(([key]) => !['endpoint', 'method'].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong>{' '}
                  <code className="text-muted">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </code>
                </div>
              ))}
          </>
        )}

        {(!context || Object.keys(context).length === 0) &&
          row.accessed_fields.length === 0 && (
            <span className="text-muted">
              {translate('No additional details available')}
            </span>
          )}
      </div>
    </ExpandableContainer>
  );
};
