import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm, reset } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AttributeFilterOrganizationGroup } from '@waldur/marketplace/category/filters/AttributeFilterOrganizationGroup';
import { AttributeFilterSection } from '@waldur/marketplace/category/filters/AttributeFilterSection';
import { MARKETPLACE_FILTER_FORM } from '@waldur/marketplace/category/store/constants';
import { prepareAttributeSections } from '@waldur/marketplace/category/utils';
import { OrganizationGroup, Section } from '@waldur/marketplace/types';

interface OwnProps {
  organizationGroups: OrganizationGroup[];
  sections: Section[];
  closeDropdown: () => void;
}

const PureCategorySectionsFilterForm: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const onClearFilter = () => {
    dispatch(reset(MARKETPLACE_FILTER_FORM));
  };
  const onCollapseFilter = () => {
    props.closeDropdown();
  };

  return (
    <div className="categorySectionsFilterForm shadow-lg">
      <form>
        {props.organizationGroups?.length > 0 && (
          <AttributeFilterOrganizationGroup
            organizationGroups={props.organizationGroups}
          />
        )}
        {prepareAttributeSections(props.sections).map(
          (section: Section, index: number) => (
            <AttributeFilterSection key={index} section={section} />
          ),
        )}
      </form>
      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={onClearFilter} className="me-4">
          {translate('Clear all')}
        </Button>
        <Button variant="success" onClick={onCollapseFilter}>
          {translate('Collapse filter')}
        </Button>
      </div>
    </div>
  );
};

export const CategorySectionsFilterForm = reduxForm<any, OwnProps>({
  form: MARKETPLACE_FILTER_FORM,
})(PureCategorySectionsFilterForm);
