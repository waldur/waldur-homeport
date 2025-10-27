import React from 'react';
import { Field, reduxForm } from 'redux-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PurePublicOfferingSoftwareCatalogFilter = () => (
  <>
    <TableFilterItem title={translate('Catalog')} name="catalog_name">
      <Field name="catalog_name" component={StringField} />
    </TableFilterItem>
    <TableFilterItem title={translate('Version')} name="catalog_version">
      <Field name="catalog_version" component={StringField} />
    </TableFilterItem>
  </>
);

export const PublicOfferingSoftwareCatalogFilter = reduxForm({
  form: 'publicOfferingSoftwareCatalogFilter',
  destroyOnUnmount: false,
})(PurePublicOfferingSoftwareCatalogFilter) as React.ComponentType;
