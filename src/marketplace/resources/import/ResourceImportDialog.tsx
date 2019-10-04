import * as React from 'react';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getAllOfferings, getImportableResources } from '@waldur/marketplace/common/api';
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

const OfferingsList = ({ choices, value, onChange }) => (
  <ul>
    {choices.map((offering, index) => (
      <li key={index} onClick={() => onChange(offering)}>
        {value === offering ? '* ' : ''}
        {offering.name}
      </li>
    ))}
  </ul>
);

const toggleElement = (element, list) =>
  list.includes(element) ? [
    ...list.slice(0, list.indexOf(element)),
    ...list.slice(list.indexOf(element) + 1),
  ] : [
    ...list,
    element,
  ];

const ImportableResourcesList = ({ offering, value, onChange, plans, setPlans }) => (
  <Query
    variables={offering.uuid}
    loader={getImportableResources}>
    {queryProps =>
      queryProps.loading ? <LoadingSpinner/> :
      queryProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
      <table className="table table-bordered">
        {(queryProps.data as any[]).map((resource, index) => (
          <tr key={index}>
            <td>
              <ResourceIcon
                resource={{name: resource.name, uuid: resource.backend_id, resource_type: resource.type}}
              />
            </td>
            <td onClick={() => onChange(toggleElement(resource, value))}>
              {value.includes(resource) ? '+' : '-'}
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
        ))}
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
      footer={<CloseDialogButton/>}>
      <Query
        variables={props.resolve}
        loader={loadOfferings}>
        {queryProps =>
          queryProps.loading ? <LoadingSpinner/> :
          queryProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
          <>
            <OfferingsList
              choices={queryProps.data.offerings}
              value={offering}
              onChange={setOffering}
            />
            {offering && (
              <ImportableResourcesList
                offering={offering}
                value={resources}
                onChange={setResources}
                plans={plans}
                setPlans={setPlans}
              />
            )}
          </>
        }
      </Query>
    </ModalDialog>
  );
};

export default connectAngularComponent(ResourceImportDialog, ['resolve']);
