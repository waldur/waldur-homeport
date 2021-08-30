import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import './CategoriesListHeader.scss';

interface CategoriesListHeaderProps {
  categories: Category[];
  onClearCategoriesFilter: () => void;
}

const getNumberOfAllCategories = (categories: Category[]) =>
  categories.reduce(
    (acc: number, currentValue: Category) => acc + currentValue.offering_count,
    0,
  );

export const CategoriesListHeader: FunctionComponent<CategoriesListHeaderProps> = ({
  categories,
  onClearCategoriesFilter,
}) => (
  <div className="categoriesListHeader">
    <h1>{translate('Category')}</h1>
    <span onClick={onClearCategoriesFilter}>
      {translate('Show all ({numberOfAllCategories})', {
        numberOfAllCategories: getNumberOfAllCategories(categories),
      })}
    </span>
  </div>
);
