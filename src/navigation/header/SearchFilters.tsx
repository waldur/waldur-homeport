import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { StringField } from '@waldur/form';
import { reactSelectMenuNoPortaling } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
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
      <OfferingAutocomplete reactSelectProps={reactSelectMenuNoPortaling()} />
    </div>
    <div className="mb-5">
      <CategoryFilter reactSelectProps={reactSelectMenuNoPortaling()} />
    </div>
    <div className="mb-8">
      <ResourceStateFilter reactSelectProps={reactSelectMenuNoPortaling()} />
    </div>
  </>
);

const enhance = reduxForm({
  form: 'globalSearchFilters',
  destroyOnUnmount: false,
});

export const SearchFilters = enhance(PureSearchFilters);
