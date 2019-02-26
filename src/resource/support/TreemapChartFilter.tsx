import * as React from 'react';
import { reduxForm, Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n/translate';

import { QuotaSelector } from './QuotaSelector';
import { QuotaList, QuotaChoice } from './types';

interface TreemapChartFilterProps {
  quotas: QuotaList;
  loading: boolean;
}

export const PureTreemapChartFilter = (props: TreemapChartFilterProps) => (
  <div className="ibox">
    <div className="ibox-content border-bottom">
      <div className="row">
        <div className="col-sm-9">
          <Field
            name="accounting_is_running"
            component={fieldProps =>
              <AwesomeCheckbox
                label={translate('Show with running accounting')}
                id="accounting-is-running"
                disabled={props.loading}
                {...fieldProps.input}
              />
            }
          />
        </div>
        <div className="col-sm-3">
          <Field
            name="quota"
            component={fieldProps =>
              <QuotaSelector
                quotas={props.quotas}
                value={fieldProps.input.value}
                handleChange={fieldProps.input.onChange}
                disabled={props.loading}
              />
            }
          />
        </div>
      </div>
    </div>
  </div>
);

export const TreemapChartFilter = reduxForm<
  {
    accounting_is_running: boolean,
    quota: QuotaChoice,
  },
  TreemapChartFilterProps
>({form: 'treemapFilter', initialValues: {
  quota: {
    key: 'nc_resource_count',
    title: translate('Resources'),
  },
}})(PureTreemapChartFilter);
