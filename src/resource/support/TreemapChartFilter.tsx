import * as React from 'react';
import { useState } from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { reduxForm, Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n/translate';

import { QuotaSelector } from './QuotaSelector';
import { QuotaList, QuotaChoice } from './types';

import './TreemapChartFilter.scss';

interface TreemapChartFilterProps {
  quotas: QuotaList;
  loading: boolean;
  total?: number;
}

export const PureTreemapChartFilter = (props: TreemapChartFilterProps) => {
  const [open, setOpen] = useState(true);
  const togglePanel = () => {
    setOpen(!open);
  };

  return (
    <Panel expanded={open}>
      <Panel.Heading>
        <Panel.Title>
          <h4 id="toggle-controls-label" onClick={togglePanel}>
            {translate('{state} controls', {
              state: !open ? 'Show' : 'Hide',
            })}
          </h4>
        </Panel.Title>
      </Panel.Heading>

      <Panel.Collapse>
        <Panel.Body>
          <div className="ibox">
            <div className="ibox-content border-bottom">
              <div className="row">
                <div className="col-sm-9">
                  <Field
                    name="accounting_is_running"
                    component={fieldProps => (
                      <AwesomeCheckbox
                        label={translate('Show with running accounting')}
                        id="accounting-is-running"
                        disabled={props.loading}
                        {...fieldProps.input}
                      />
                    )}
                  />
                </div>
                <div className="col-sm-3">
                  <Field
                    name="quota"
                    component={fieldProps => (
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
        </Panel.Body>
      </Panel.Collapse>
    </Panel>
  );
};

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
