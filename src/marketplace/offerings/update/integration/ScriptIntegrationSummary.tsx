import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { EditIntegrationButton } from './EditIntegrationButton';
import { EditScriptButton } from './EditScriptButton';
import { EditVarsButton } from './EditVarsButton';
import { SCRIPT_ROWS } from './utils';

export const ScriptIntegrationSummary = ({ offering, refetch }) => (
  <Card className="mb-10" id="integration">
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
        <EditIntegrationButton offering={offering} refetch={refetch} />
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
                    dry_run={dry_run}
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
