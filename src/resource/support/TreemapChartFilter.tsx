import { FunctionComponent } from 'react';
import { Accordion } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n/translate';

import { QuotaSelector } from './QuotaSelector';
import './TreemapChartFilter.scss';
import { QuotaChoice, QuotaList } from './types';

interface TreemapChartFilterProps {
  quotas: QuotaList;
  loading: boolean;
  total?: number;
}

export const PureTreemapChartFilter: FunctionComponent<TreemapChartFilterProps> =
  (props) => (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <h4 id="toggle-controls-label">
            {open ? translate('Hide controls') : translate('Show controls')}
          </h4>
        </Accordion.Header>

        <Accordion.Body>
          <div className="card">
            <div className="card-body border-bottom">
              <div className="row">
                <div className="col-sm-9">
                  <Field
                    name="accounting_is_running"
                    component={AwesomeCheckboxField}
                    label={translate('Show with running accounting')}
                    disabled={props.loading}
                  />
                </div>
                <div className="col-sm-3">
                  <Field
                    name="quota"
                    component={(fieldProps) => (
                      <QuotaSelector
                        quotas={props.quotas}
                        value={fieldProps.input.value}
                        handleChange={fieldProps.input.onChange}
                        disabled={props.loading}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 text-right">
                  {translate('Total: {total}', {
                    total: props.total,
                  })}
                </div>
              </div>
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );

export const TreemapChartFilter = reduxForm<
  {
    accounting_is_running: boolean;
    quota: QuotaChoice;
  },
  TreemapChartFilterProps
>({
  form: 'treemapFilter',
  initialValues: {
    quota: {
      key: 'nc_resource_count',
      title: translate('Resources'),
    },
  },
})(PureTreemapChartFilter);
