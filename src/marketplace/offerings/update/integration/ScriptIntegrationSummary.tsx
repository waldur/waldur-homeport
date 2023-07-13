import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { EditScriptButton } from './EditScriptButton';
import { EditVarsButton } from './EditVarsButton';

const SCRIPT_ROWS = [
  { label: translate('Script language'), type: 'language' },
  {
    label: translate('Script for creation of a resource'),
    type: 'create',
    dry_run: 'Create',
  },
  {
    label: translate('Script for termination of a resource'),
    type: 'delete',
    dry_run: 'Terminate',
  },
  {
    label: translate('Script for updating a resource on plan change'),
    type: 'update',
    dry_run: 'Update',
  },
  {
    label: translate(
      'Script for regular update of resource and its accounting',
    ),
    type: 'pull',
    dry_run: 'Pull',
  },
];

export const ScriptIntegrationSummary = ({ offering, refetch }) => (
  <Card className="mb-10">
    <div className="border-2 border-bottom card-header">
      <div className="card-title h5">
        {SCRIPT_ROWS.every((option) => offering.secret_options[option.type]) ? (
          <i className="fa fa-check text-success me-3" />
        ) : (
          <i className="fa fa-warning text-danger me-3" />
        )}
        {translate('Integration')}
      </div>
      <div className="card-toolbar">
        <EditVarsButton offering={offering} refetch={refetch} />
      </div>
    </div>
    <Card.Body>
      <Table bordered={true} hover={true} responsive={true}>
        <tbody>
          {SCRIPT_ROWS.map(({ label, type, dry_run }) => (
            <tr key={type}>
              <td className="col-md-1">
                <i
                  className={
                    offering.secret_options[type]
                      ? 'fa fa-check text-info'
                      : 'fa fa-times text-danger'
                  }
                />
              </td>
              <td className="col-md-11">
                {type === 'language'
                  ? translate('Script language: {language}', {
                      language: offering.secret_options.language,
                    })
                  : label}
              </td>
              <td className="row-actions">
                <div>
                  <EditScriptButton
                    type={type}
                    dryRun={dry_run}
                    label={label}
                    offering={offering}
                    refetch={refetch}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);
