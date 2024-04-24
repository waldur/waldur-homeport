import { FC, useMemo } from 'react';

import { BaseEventsList } from '@waldur/events/BaseEventsList';

export const ResourceEvents: FC<{
  marketplaceResource;
  title?;
  id?;
  initialPageSize?;
  className?;
  actions?;
}> = ({
  marketplaceResource,
  title,
  id,
  initialPageSize,
  className,
  actions,
}) => {
  const filter = useMemo(
    () => ({ scope: marketplaceResource?.url }),
    [marketplaceResource],
  );
  return (
    <BaseEventsList
      filter={filter}
      table={`events-${marketplaceResource?.uuid}`}
      title={title}
      id={id}
      initialPageSize={initialPageSize}
      className={className}
      actions={actions}
    />
  );
};
