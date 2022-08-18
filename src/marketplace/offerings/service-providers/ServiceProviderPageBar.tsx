import { FC, useEffect } from 'react';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';

import { CategoriesList } from './CategoriesList';
import { CategorySectionsFilterBar } from './CategorySectionsFilterBar';

interface ServiceProviderPageBarProps {
  categories: Category[];
  onCategoryChange: (newCategory: string) => void;
  categoryUuid: string;
}

export const ServiceProviderPageBar: FC<ServiceProviderPageBarProps> = (
  props,
) => {
  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <div className="ServiceProvider-page-bar bg-body">
      <div className="container-fluid">
        <div className="d-flex scroll-x">
          <div className="d-flex align-items-stretch">
            <div>
              <button
                type="button"
                className="btn dropdown"
                data-kt-menu-trigger="click"
                data-kt-menu-placement="bottom-start"
              >
                {translate('Categories')}
                <i className="fa fa-chevron-down lh-base ms-2 fs-6" />
              </button>

              <div
                className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px"
                data-kt-menu="true"
                data-popper-placement="bottom-start"
              >
                <CategoriesList
                  categories={props.categories}
                  onCategoryChange={props.onCategoryChange}
                />
              </div>
            </div>
            {props.categoryUuid && (
              <CategorySectionsFilterBar categoryUuid={props.categoryUuid} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
