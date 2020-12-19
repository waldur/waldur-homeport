import { FunctionComponent } from 'react';
import { Panel } from 'react-bootstrap';
import { useToggle } from 'react-use';
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

export const PureTreemapChartFilter: FunctionComponent<TreemapChartFilterProps> = (
  props,
) => {
  const [open, togglePanel] = useToggle(true);

  return (
    <Panel expanded={open}>
      <Panel.Heading>
        <Panel.Title>
          <h4 id="toggle-controls-label" onClick={togglePanel}>
            {open ? translate('Hide controls') : translate('Show controls')}
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
