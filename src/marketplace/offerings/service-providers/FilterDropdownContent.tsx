import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getAllOrganizationGroups,
  getCategory,
} from '@waldur/marketplace/common/api';
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
      value: filterData,
    } = useAsync(async () => {
      const sections = await getCategorySections(categoryUuid);
      const organizationGroups = await getAllOrganizationGroups();
      return {
        sections,
        organizationGroups,
      };
    }, [categoryUuid]);

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
        ) : !filterData?.sections?.length &&
          !filterData?.organizationGroups?.length ? (
          <p> {translate("Category doesn't contain sections.")}</p>
        ) : filterData ? (
          <CategorySectionsFilterForm
            organizationGroups={filterData.organizationGroups}
            sections={filterData.sections}
            closeDropdown={closeDropdown}
          />
        ) : null}
      </div>
    );
  };
