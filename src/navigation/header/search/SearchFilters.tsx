import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { StringField } from '@waldur/form';
import { REACT_SELECT_MENU_NO_PORTALING } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OfferingTypeAutocomplete } from '@waldur/marketplace/offerings/details/OfferingTypeAutocomplete';
import { CategoryFilter } from '@waldur/marketplace/resources/list/CategoryFilter';
import { ResourceStateFilter } from '@waldur/marketplace/resources/list/ResourceStateFilter';

const PureSearchFilters: FunctionComponent<{}> = () => (
  <>
    <div className="mb-5">
      <Field
        name="query"
        component={StringField}
        label={translate('Search')}
        placeholder={translate('Contains the word')}
      />
    </div>
    <div className="mb-5">
      <OfferingAutocomplete reactSelectProps={REACT_SELECT_MENU_NO_PORTALING} />
    </div>
    <div className="mb-5">
      <CategoryFilter reactSelectProps={REACT_SELECT_MENU_NO_PORTALING} />
    </div>
    <div className="mb-5">
      <OfferingTypeAutocomplete
        reactSelectProps={REACT_SELECT_MENU_NO_PORTALING}
      />
    </div>
    <div className="mb-8">
      <ResourceStateFilter reactSelectProps={REACT_SELECT_MENU_NO_PORTALING} />
    </div>
  </>
);

const enhance = reduxForm({
  form: 'globalSearchFilters',
  destroyOnUnmount: false,
});

export const SearchFilters = enhance(PureSearchFilters);
