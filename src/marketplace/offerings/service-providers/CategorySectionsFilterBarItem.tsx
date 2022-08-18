import { FC } from 'react';

interface CategorySectionsFilterBarItemProps {
  text: string;
}

export const CategorySectionsFilterBarItem: FC<CategorySectionsFilterBarItemProps> =
  ({ text, children }) => {
    return (
      <div>
        <button
          type="button"
          className="btn dropdown"
          data-kt-menu-trigger="click"
          data-kt-menu-placement="bottom-start"
        >
          {text}
          <i className="fa fa-chevron-down lh-base ms-2 fs-6" />
        </button>

        <div
          className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px"
          data-kt-menu="true"
          data-popper-placement="bottom-start"
        >
          {children}
        </div>
      </div>
    );
  };
