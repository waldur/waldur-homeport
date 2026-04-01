import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CategoryColumn } from '@waldur/marketplace/types';
import { validateIP } from '@waldur/marketplace/utils';
import { IPList } from '@waldur/resource/IPList';
import { BooleanField } from '@waldur/table/BooleanField';
import { renderFieldOrDash } from '@waldur/table/utils';

interface CategoryColumnFieldProps {
  row: Resource;
  column: CategoryColumn;
  for_export?: boolean;
}

export const CategoryColumnField: FunctionComponent<
  CategoryColumnFieldProps
> = (props) => {
  const { row, column } = props;
  const metadata = row.backend_metadata;
  const attr = column.attribute;

  const value = attr ? (row[attr] ?? metadata?.[attr]) : undefined;

  switch (column.widget) {
    case 'csv':
      if (!Array.isArray(value) || value.length === 0) {
        return 'N/A';
      }
      if (validateIP(value[0]) && !props.for_export) {
        return <IPList value={value} />;
      } else {
        return value.join(', ');
      }

    case 'filesize':
      return formatFilesize(value);

    default:
      if (typeof value === 'boolean') {
        return props.for_export ? (
          value ? (
            translate('Yes')
          ) : (
            translate('No')
          )
        ) : (
          <BooleanField value={value} />
        );
      } else if (typeof value === 'string' && value) {
        return (
          <>
            {value} <CopyToClipboardButton value={value} />
          </>
        );
      }
      return renderFieldOrDash(value);
  }
};
