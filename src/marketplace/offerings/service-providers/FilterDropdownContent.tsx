import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { CategorySectionsFilterForm } from '@waldur/marketplace/offerings/service-providers/CategorySectionsFilterForm';
import './FilterDropdownContent.scss';

interface FilterDropdownContentProps {
  toggle: boolean;
  categoryUuid: string;
  closeDropdown: () => void;
}

const getCategorySections = async (categoryUuid: string) => {
  const response = await getCategory(categoryUuid);
  return response?.sections;
};

export const FilterDropdownContent: FunctionComponent<FilterDropdownContentProps> =
  ({ toggle, categoryUuid, closeDropdown }) => {
    const {
      loading,
      error,
      value: sections,
    } = useAsync(() => getCategorySections(categoryUuid), [categoryUuid]);
    return (
      <div
        className={classNames('filterDropdownContent', {
          'filterDropdownContent--hidden': !toggle,
        })}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p> {translate('Unable to load category sections.')}</p>
        ) : sections && sections.length === 0 ? (
          <p> {translate("Category doesn't contain sections.")}</p>
        ) : sections && sections.length > 0 ? (
          <CategorySectionsFilterForm
            sections={sections}
            closeDropdown={closeDropdown}
          />
        ) : null}
      </div>
    );
  };
