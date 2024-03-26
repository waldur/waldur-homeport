import Markdown from 'markdown-to-jsx';
import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { Call } from '@waldur/proposals/types';

import { EditGeneralInfoButton } from './EditGeneralInfoButton';

interface CallGeneralSectionProps {
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  return (
    <Card id="general" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {!props.call.description ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('General')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Table bordered={true} hover={true} responsive={true}>
          <tbody>
            <tr>
              <td className="col-md-3">{translate('Name')}</td>
              <td className="col-md-9">{props.call.name || 'N/A'}</td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="name"
                    title={translate('Edit name')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Description')}</td>
              <td className="col-md-9">
                {props.call.description ? (
                  <Markdown>{props.call.description}</Markdown>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="description"
                    title={translate('Edit description')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Reference code')}</td>
              <td className="col-md-9">{props.call.reference_code || 'N/A'}</td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="reference_code"
                    title={translate('Edit reference code')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="col-md-3">{translate('Default project role')}</td>
              <td className="col-md-9">
                {formatRole(props.call.default_project_role_name) ||
                  formatRole(RoleEnum.PROJECT_ADMIN)}
              </td>
              <td className="row-actions">
                <div>
                  <EditGeneralInfoButton
                    call={props.call}
                    name="default_project_role"
                    title={translate('Edit default project role')}
                    refetch={props.refetch}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
