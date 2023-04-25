import { FunctionComponent, useEffect } from 'react';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AttributeFilterOrganizationGroup } from '@waldur/marketplace/category/filters/AttributeFilterOrganizationGroup';
import { AttributeFilterSection } from '@waldur/marketplace/category/filters/AttributeFilterSection';
import { prepareAttributeSections } from '@waldur/marketplace/category/utils';
import {
  getAllOrganizationGroups,
  getCategory,
} from '@waldur/marketplace/common/api';
import { OFFERING_CATEGORY_SECTION_FORM_ID } from '@waldur/marketplace/offerings/service-providers/constants';
import { Section } from '@waldur/marketplace/types';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';

import { CategorySectionsFilterBarItem } from './CategorySectionsFilterBarItem';

import './CategorySectionsFilterForm.scss';

interface OwnProps {
  categoryUuid: string;
}

const getCategorySections = async (categoryUuid: string) => {
  const response = await getCategory(categoryUuid);
  return response?.sections;
};

const PureCategorySectionsFilterBar: FunctionComponent<any> = ({
  categoryUuid,
}) => {
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

  useEffect(() => {
    if (filterData?.sections.length || filterData?.organizationGroups.length) {
      MenuComponent.reinitialization();
    }
  }, [filterData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load category sections.')}
      </h3>
    );
  }

  if (!filterData.sections.length && !filterData.organizationGroups.length) {
    return null;
  }

  return (
    <form className="d-flex align-items-center align-items-stretch">
      {filterData.organizationGroups?.length > 0 && (
        <CategorySectionsFilterBarItem text={translate('Organization groups')}>
          <AttributeFilterOrganizationGroup
            organizationGroups={filterData.organizationGroups}
          />
        </CategorySectionsFilterBarItem>
      )}
      {prepareAttributeSections(filterData.sections).map(
        (section: Section, index: number) => (
          <CategorySectionsFilterBarItem key={index} text={section.title}>
            <AttributeFilterSection section={section} />
          </CategorySectionsFilterBarItem>
        ),
      )}
    </form>
  );
};

export const CategorySectionsFilterBar = reduxForm<any, OwnProps>({
  form: OFFERING_CATEGORY_SECTION_FORM_ID,
})(PureCategorySectionsFilterBar);
