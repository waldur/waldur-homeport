import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as selectors from '@waldur/marketplace/category/store/selectors';

import { CategorySectionsFilterForm } from './CategorySectionsFilterForm';

interface FilterDropdownContentProps {
  toggle: boolean;
  closeDropdown: () => void;
}

export const FilterDropdownContent: FunctionComponent<FilterDropdownContentProps> =
  ({ toggle, closeDropdown }) => {
    const loading = useSelector(selectors.isLoading);
    const error = useSelector(selectors.isErred);
    const sections = useSelector(selectors.getSections);
    const divisions = useSelector(selectors.getDivisions).items;

    return (
      <div
        className={classNames('filterDropdownContent bg-body', {
          'd-none': !toggle,
        })}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-gray-600 fs-4 fw-bold p-8 shadow-sm text-center">
            {translate('Unable to load category sections.')}
          </p>
        ) : !sections?.length && !divisions?.length ? (
          <p className="text-gray-600 fs-4 fw-bold p-8 shadow-sm text-center">
            {translate("Category doesn't contain sections.")}
          </p>
        ) : (
          <CategorySectionsFilterForm
            divisions={divisions}
            sections={sections}
            closeDropdown={closeDropdown}
          />
        )}
      </div>
    );
  };
