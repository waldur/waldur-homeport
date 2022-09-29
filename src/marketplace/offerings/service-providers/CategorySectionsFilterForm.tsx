import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { AttributeFilterDivision } from '@waldur/marketplace/category/filters/AttributeFilterDivision';
import { AttributeFilterSection } from '@waldur/marketplace/category/filters/AttributeFilterSection';
import { prepareAttributeSections } from '@waldur/marketplace/category/utils';
import { CategorySectionsFilterFormActions } from '@waldur/marketplace/offerings/service-providers/CategorySectionsFilterFormActions';
import { OFFERING_CATEGORY_SECTION_FORM_ID } from '@waldur/marketplace/offerings/service-providers/constants';
import { Division, Section } from '@waldur/marketplace/types';
import './CategorySectionsFilterForm.scss';

interface OwnProps {
  divisions: Division[];
  sections: Section[];
  closeDropdown: () => void;
}

const PureCategorySectionsFilterForm: FunctionComponent<any> = (props) => (
  <div className="categorySectionsFilterForm">
    <form>
      {props.divisions?.length > 0 && (
        <AttributeFilterDivision divisions={props.divisions} />
      )}
      {prepareAttributeSections(props.sections).map(
        (section: Section, index: number) => (
          <AttributeFilterSection key={index} section={section} />
        ),
      )}
    </form>
    <CategorySectionsFilterFormActions closeDropdown={props.closeDropdown} />
  </div>
);

export const CategorySectionsFilterForm = reduxForm<any, OwnProps>({
  form: OFFERING_CATEGORY_SECTION_FORM_ID,
})(PureCategorySectionsFilterForm);
