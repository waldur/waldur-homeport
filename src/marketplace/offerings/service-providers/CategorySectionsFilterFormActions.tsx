import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { reset } from 'redux-form';

import { OFFERING_CATEGORY_SECTION_FORM_ID } from '@waldur/marketplace/offerings/service-providers/constants';
import { Button } from '@waldur/marketplace/offerings/service-providers/shared/Button';

import './CategorySectionsFilterFormActions.scss';

interface CategorySectionsFilterFormActionsProps {
  closeDropdown: () => void;
}

export const CategorySectionsFilterFormActions: FunctionComponent<CategorySectionsFilterFormActionsProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const onClearFilter = () => {
    dispatch(reset(OFFERING_CATEGORY_SECTION_FORM_ID));
  };
  const onCollapseFilter = () => {
    props.closeDropdown();
  };
  return (
    <div className="categorySectionsFilterFormActions">
      <Button label="Clear All" onClick={onClearFilter} />
      <Button label="Collapse Filter" onClick={onCollapseFilter} />
    </div>
  );
};
