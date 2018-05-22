import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { compose } from 'redux';
import { reduxForm, Field } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { formatServiceProviders } from './utils';

import './VmOverviewFilter.scss';

interface PureVmOverviewFilterProps extends TranslateProps {
  serviceProviders: any[];
}
const PureVmOverviewFilter = (props: PureVmOverviewFilterProps) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <div className="checkbox awesome-checkbox m-r-sm">
          <Field name="shared" component="input" type="checkbox" id="show-shared"/>
          <label htmlFor="show-shared">
            {props.translate('Show shared')}
          </label>
        </div>
        <div className="form-group">
          <Field name="service_provider"
            component={prop =>
              <Select
                className="service-provider-selector"
                placeholder={props.translate('Select service provider')}
                labelKey="name"
                valueKey="value"
                value={prop.input.value}
                onChange={prop.input.onChange}
                onBlur={() => prop.input.onBlur(prop.input.value)}
                options={formatServiceProviders(props.serviceProviders)}
                multi={true}
              />
            }
          />
        </div>
      </form>
    </div>
  </div>
);

const mapStateToProps = (_, ownProps) => ({...ownProps});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: 'vmOverviewFilter',
    initialValues: {shared: true},
  }),
  withTranslation,
);

export const VmOverviewFilter = enhance(PureVmOverviewFilter);
