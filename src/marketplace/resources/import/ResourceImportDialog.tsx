import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getAllOfferings, getImportableResources } from '@waldur/marketplace/common/api';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingsList } from './OfferingsList';
import { ResourcesList } from './ResourcesList';

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
        {offeringsProps =>
          offeringsProps.loading ? <LoadingSpinner/> :
          offeringsProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
          <Row>
            <Col lg={12}>
              <Panel
                className="float-e-margins"
                title={translate('Step 1. Select offering')}>
                <OfferingsList
                  choices={offeringsProps.data.offerings}
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
                  <Query
                    variables={offering.uuid}
                    loader={getImportableResources}>
                    {resourceProps =>
                      resourceProps.loading ? <LoadingSpinner/> :
                      resourceProps.erred ? <h3>{translate('Unable to load data.')}</h3> :
                      <ResourcesList
                        resources={resourceProps.data}
                        offering={offering}
                        value={resources}
                        onChange={setResources}
                        plans={plans}
                        setPlans={setPlans}
                      />
                    }
                  </Query>
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
