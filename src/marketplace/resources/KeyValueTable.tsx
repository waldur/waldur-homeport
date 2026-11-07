import { FunctionComponent, ReactNode } from 'react';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';

interface KeyValueTableProps {
  items?: Record<string, any>;
}

export const KeyValueTable: FunctionComponent<KeyValueTableProps> = ({
  items,
}) => {
  if (!items || Object.keys(items).length === 0) {
    return (
      <p className="py-4 text-center text-sm text-quaternary">
        {translate('No attributes found.')}
      </p>
    );
  }

  return (
    <PropertyList variant="divided">
      {Object.entries(items).map(([key, value]) => {
        let renderedValue: ReactNode;
        const isPrimitive =
          typeof value === 'string' || typeof value === 'number';

        if (Array.isArray(value)) {
          renderedValue =
            value.length > 0 ? value.join(', ') : translate('None');
        } else if (typeof value === 'object' && value !== null) {
          renderedValue = (
            <pre className="max-h-60 overflow-auto rounded-lg bg-secondary p-2 font-mono text-xs text-primary">
              {JSON.stringify(value, null, 2)}
            </pre>
          );
        } else if (typeof value === 'boolean') {
          renderedValue = value ? translate('True') : translate('False');
        } else {
          renderedValue = String(value ?? '');
        }

        return (
          <PropertyItem
            key={key}
            label={key}
            value={renderedValue}
            copyValue={isPrimitive ? String(value) : undefined}
          />
        );
      })}
    </PropertyList>
  );
};
