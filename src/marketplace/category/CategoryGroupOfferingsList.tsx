import { FunctionComponent, useMemo } from 'react';

import { PublicOfferingsList } from './PublicOfferingsList';

export const CategoryGroupOfferingsList: FunctionComponent<{
  categoryGroup;
}> = ({ categoryGroup }) => {
  const filter = useMemo(
    () => ({ category_group_uuid: categoryGroup.uuid }),
    [categoryGroup],
  );
  return <PublicOfferingsList filter={filter} />;
};
