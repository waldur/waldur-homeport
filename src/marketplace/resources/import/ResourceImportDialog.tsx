import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getAllOfferings, getImportableResources } from '@waldur/marketplace/common/api';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ResourceIcon } from '@waldur/resource/ResourceName';
import { connectAngularComponent } from '@waldur/store/connect';

interface Props {
  resolve: {
    category_uuid: string;
    project_uuid: string;
  };
}

const loadOfferings = async resolve => {
  const offerings = await getAllOfferings({params: resolve});
  return {offerings};
};

const SelectOfferingButton = ({ value, onChange }) => (
  <a className={classNames('btn btn-xs btn-block-sm btn-block-md btn-outline',
      value ? 'btn-primary' : 'btn-default')}
    onClick={onChange}>
    {' '}
    {value ? translate('Selected') : translate('Select')}
    {' '}
    <i className={classNames('fa', value ? 'fa-check' : 'fa-long-arrow-right')}/>
  </a>
);

const SelectResourceButton = ({ value, onChange }) => (
  <a className={classNames('btn btn-sm btn-outline',
      value ? 'btn-primary' : 'btn-default')} onClick={onChange}>
    {value ? translate('Selected') : translate('Select')}
  </a>
);

const OfferingItem = ({ offering, value, onChange }) => (
  <Panel className="provider-box cursor-pointer">
    <div className="m-md">
      <a className="h5 ellipsis">
        {offering.name}
      </a>
    </div>
    <div className="text-center m-b m-t">
      <OfferingLogo src={offering.thumbnail} size="small"/>
    </div>
    <div className="p-xs">
      <div className="block-container-sm block-container-md pull-right">
        <SelectOfferingButton
          value={value === offering}
          onChange={() => onChange(value)}
        />
      </div>
    </div>
  </Panel>
);

const OfferingsList = ({ choices, value, onChange }) => (
  <Row>
    {choices.map((offering, index) => (
      <Col
        key={index}
        md={3} xs={6} sm={4}
        onClick={() => onChange(offering)}>
          <OfferingItem
            value={value}
            onChange={onChange}
            offering={offering}
          />
      </Col>
    ))}
  </Row>
);

const toggleElement = (element, list) =>
  list.includes(element) ? [
    ...list.slice(0, list.indexOf(element)),
    ...list.slice(list.indexOf(element) + 1),
  ] : [
    ...list,
    element,
  ];

const ResourceRow = ({ resource, value, onChange, offering, plans, setPlans }) => (
  <tr>
    <td>
      <p className="form-control-static">
        <ResourceIcon
          resource={{name: resource.name, uuid: resource.backend_id, resource_type: resource.type}}
        />
      </p>
    </td>
    <td>
      {resource.backend_id}
    </td>
    <td>
      <SelectResourceButton
        value={value.includes(resource)}
        onChange={() => onChange(toggleElement(resource, value))}
      />
    </td>
    <td>
      <Select
        placeholder={translate('Select plan')}
        labelKey="name"
        valueKey="uuid"
        options={offering.plans}
        value={plans[resource.backend_id]}
        onChange={plan => setPlans({...plans, [resource.backend_id]: plan})}
      />
    </td>
  </tr>
);

const ImportableResourcesList = ({ offering, value, onChange, plans, setPlans }) => (
  <Query
    variables={offering.uuid}
    loader={getImportableResources}>
    {queryProps =>
      queryProps.loading ? <LoadingSpinner/> :
      queryProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
      <table className="table">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th>{translate('Backend ID')}</th>
            <th>{translate('Actions')}</th>
            <th className="col-sm-2">{translate('Plan')}</th>
          </tr>
        </thead>
        <tbody>
          {(queryProps.data as any[]).map((resource, index) => (
            <ResourceRow
              key={index}
              resource={resource}
              offering={offering}
              value={value}
              onChange={onChange}
              plans={plans}
              setPlans={setPlans}
            />
          ))}
        </tbody>
      </table>
    }
  </Query>
);

export const ResourceImportDialog: React.SFC<Props> = props => {
  const [offering, setOffering] = React.useState();
  const [resources, setResources] = React.useState([]);
  const [plans, setPlans] = React.useState({});
  return (
    <ModalDialog
      title={translate('Import resource')}
      footer={
        <>
          <button
            className={classNames('btn btn-primary', {disabled: resources.length === 0})}
            type="button">
            {translate('Import')}
          </button>
          <CloseDialogButton/>
        </>
      }>
      <Query
        variables={props.resolve}
        loader={loadOfferings}>
        {queryProps =>
          queryProps.loading ? <LoadingSpinner/> :
          queryProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
          <Row>
            <Col lg={12}>
              <Panel
                className="float-e-margins"
                title={translate('Step 1. Select offering')}>
                <OfferingsList
                  choices={queryProps.data.offerings}
                  value={offering}
                  onChange={setOffering}
                />
              </Panel>
            </Col>
            {offering && (
              <Col lg={12}>
                <Panel
                  className="float-e-margins"
                  title={translate('Step 2. Select resources')}>
                  <ImportableResourcesList
                    offering={offering}
                    value={resources}
                    onChange={setResources}
                    plans={plans}
                    setPlans={setPlans}
                  />
                </Panel>
              </Col>
            )}
          </Row>
        }
      </Query>
    </ModalDialog>
  );
};

export default connectAngularComponent(ResourceImportDialog, ['resolve']);
