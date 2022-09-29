import { FC } from 'react';

import { AttributesFilterBar } from './filters/AttributesFilterBar';

export const CategoryPageBar: FC = () => {
  return (
    <div id="category-page-bar" className="category-page-bar bg-body">
      <AttributesFilterBar />
    </div>
  );
};
