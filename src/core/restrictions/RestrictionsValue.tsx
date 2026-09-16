import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

interface RestrictionsValueProps {
  values: string[];
  emptyMessage?: string;
}

export const RestrictionsValue: FC<RestrictionsValueProps> = ({
  values,
  emptyMessage = translate('No restrictions configured'),
}) => {
  if (!values || values.length === 0) {
    return <span className="text-muted fst-italic">{emptyMessage}</span>;
  }
  return (
    <div className="d-flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value} variant="neutral" tone="light">
          {value}
        </Badge>
      ))}
    </div>
  );
};
