import { FunctionComponent, useEffect } from 'react';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AttributeFilterDivision } from '@waldur/marketplace/category/filters/AttributeFilterDivision';
import { AttributeFilterSection } from '@waldur/marketplace/category/filters/AttributeFilterSection';
import { prepareAttributeSections } from '@waldur/marketplace/category/utils';
import {
  getAllOrganizationDivisions,
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
    const divisions = await getAllOrganizationDivisions();
    return {
      sections,
      divisions,
    };
  }, [categoryUuid]);

  useEffect(() => {
    if (filterData?.sections.length || filterData?.divisions.length) {
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

  if (!filterData.sections.length && !filterData.divisions.length) {
    return null;
  }

  return (
    <form className="d-flex align-items-center align-items-stretch">
      {filterData.divisions?.length > 0 && (
        <CategorySectionsFilterBarItem text={translate('Divisions')}>
          <AttributeFilterDivision divisions={filterData.divisions} />
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
