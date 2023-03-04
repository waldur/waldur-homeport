import { translate } from '@waldur/i18n';

export const ResourcesCountColumn = ({ row }) => (
  <>
    {row.resources_count === 0
      ? translate('No active resources')
      : row.resources_count === 1
      ? translate('One resource')
      : translate('{count} resources', { count: row.resources_count })}
  </>
);
