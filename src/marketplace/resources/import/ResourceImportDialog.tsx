import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ImportButton } from './ImportButton';
import { OfferingsList } from './OfferingsList';
import { ResourcesList } from './ResourcesList';
import { ImportDialogProps } from './types';
import { useImportDialog } from './useImportDialog';

export const ResourceImportDialog: React.FC<ImportDialogProps> = (props) => {
  const {
    offering,
    selectOffering,
    resources,
    toggleResource,
    plans,
    assignPlan,
    offeringsProps,
    resourceProps,
    submitEnabled,
    handleSubmit,
    submitting,
  } = useImportDialog(props);

  return (
    <ModalDialog
      title={translate('Import resource')}
      footer={
        <>
          <ImportButton
            disabled={!submitEnabled}
            submitting={submitting}
            onClick={handleSubmit}
          />
          <CloseDialogButton />
        </>
      }
    >
      {offeringsProps.loading ? (
        <LoadingSpinner />
      ) : offeringsProps.error ? (
        <h3>{translate('Unable to load data.')}</h3>
      ) : (
        offeringsProps.value &&
        (offeringsProps.value.length === 0 ? (
          translate('There are no offerings available.')
        ) : (
          <Row>
            <Col lg={12}>
              <Panel
                className="float-e-margins"
                title={translate('Step 1. Select offering')}
              >
                <OfferingsList
                  choices={offeringsProps.value}
                  value={offering}
                  onChange={selectOffering}
                />
              </Panel>
            </Col>
            {offering && (
              <Col lg={12}>
                <Panel
                  className="float-e-margins"
                  title={translate('Step 2. Select resources')}
                >
                  {resourceProps.loading ? (
                    <LoadingSpinner />
                  ) : resourceProps.error ? (
                    <h3>{translate('Unable to load data.')}</h3>
                  ) : (
                    resourceProps.value &&
                    (resourceProps.value.length === 0 ? (
                      translate('There are no resources available.')
                    ) : (
                      <ResourcesList
                        resources={resourceProps.value}
                        offering={offering}
                        value={resources}
                        toggleResource={toggleResource}
                        plans={plans}
                        assignPlan={assignPlan}
                      />
                    ))
                  )}
                </Panel>
              </Col>
            )}
          </Row>
        ))
      )}
    </ModalDialog>
  );
};
