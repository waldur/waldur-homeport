import { FunctionComponent, useMemo } from 'react';

import { PublicOfferingsList } from './PublicOfferingsList';

export const CategoryOfferingsList: FunctionComponent<{
  category;
}> = ({ category }) => {
  const filter = useMemo(() => ({ category_uuid: category.uuid }), [category]);
  return <PublicOfferingsList filter={filter} />;
};
