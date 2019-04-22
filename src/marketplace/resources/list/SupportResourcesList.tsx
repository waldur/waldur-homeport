import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { connectTable } from '@waldur/table-react';

import { TableOptions, TableComponent } from './PublicResourcesList';

const mapStateToProps = state => ({
  filter: getFormValues('SupportResourcesFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable({
    ...TableOptions,
    table: 'SupportResourcesList',
  }),
);

export const SupportResourcesList = enhance(TableComponent) as React.ComponentType<{}>;
