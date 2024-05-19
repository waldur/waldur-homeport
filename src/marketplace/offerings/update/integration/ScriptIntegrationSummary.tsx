import { Check, X } from '@phosphor-icons/react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';

import { RefreshButton } from '../components/RefreshButton';

import { EditIntegrationButton } from './EditIntegrationButton';
import { EditScriptButton } from './EditScriptButton';
import { EditVarsButton } from './EditVarsButton';
import { SCRIPT_ROWS } from './utils';

export const ScriptIntegrationSummary = ({ offering, refetch, loading }) => (
  <Card id="integration">
    <Card.Header className="border-2 border-bottom">
      <Card.Title className="h5">
        <ValidationIcon
          value={SCRIPT_ROWS.every(
            (option) => offering.secret_options[option.type],
          )}
        />
        <span className="me-2">{translate('Integration')}</span>
        <RefreshButton refetch={refetch} loading={loading} />
      </Card.Title>
      <div className="card-toolbar">
        <EditVarsButton offering={offering} refetch={refetch} />
        <EditIntegrationButton offering={offering} refetch={refetch} />
      </div>
    </Card.Header>
    <Card.Body>
      <Table bordered={true} hover={true} responsive={true}>
        <tbody>
          {SCRIPT_ROWS.map(({ label, type, dry_run }) => (
            <tr key={type}>
              <td className="col-md-1">
                {offering.secret_options[type] ? (
                  <Check weight="bold" className="text-info" />
                ) : (
                  <X weight="bold" className="text-danger" />
                )}
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
