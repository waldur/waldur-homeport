import { FC } from 'react';

import { translate } from '@waldur/i18n';

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
        <span key={value} className="badge badge-light">
          {value}
        </span>
      ))}
    </div>
  );
};
