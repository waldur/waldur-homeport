import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Table from 'react-bootstrap/lib/Table';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const ApplicationDetailsTable = ({ application }) => (
  <Table bordered responsive>
    <thead>
      <tr>
        <th>{translate('Key')}</th>
        <th>{translate('Value')}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{translate('Version')}</td>
        <td>{application.version}</td>
      </tr>
      <tr>
        <td>{translate('Template')}</td>
        <td>{application.template}</td>
      </tr>
      <tr>
        <td>{translate('Catalog')}</td>
        <td>{application.catalog}</td>
      </tr>
      <tr>
        <td>{translate('Link')}</td>
        <td>
          <ExternalLink url={application.url} label={translate('Open')} />
        </td>
      </tr>
    </tbody>
  </Table>
);

const ApplicationAnswersTable = ({ application }) => (
  <Table bordered responsive>
    <thead>
      <tr>
        <th>{translate('Question')}</th>
        <th>{translate('Answer')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(application.answers).map(key => {
        const value = application.answers[key];
        return (
          <tr key={key}>
            <td className="ellipsis">{key}</td>
            <td>{typeof value === 'object' ? JSON.stringify(value) : value}</td>
          </tr>
        );
      })}
    </tbody>
  </Table>
);

export const ApplicationDetailsDialog = ({ resolve: { application } }) => (
  <ModalDialog
    title={translate('Application details')}
    footer={<CloseDialogButton />}
  >
    <PanelGroup
      accordion={true}
      id="application-details"
      defaultActiveKey="summary"
    >
      <Panel eventKey="summary">
        <Panel.Heading>
          <Panel.Title toggle={true}>{translate('Summary')}</Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible={true}>
          <ApplicationDetailsTable application={application} />
        </Panel.Body>
      </Panel>
      {application.answers && (
        <Panel eventKey="answers">
          <Panel.Heading>
            <Panel.Title toggle={true}>{translate('Answers')}</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible={true}>
            <ApplicationAnswersTable application={application} />
          </Panel.Body>
        </Panel>
      )}
    </PanelGroup>
  </ModalDialog>
);
