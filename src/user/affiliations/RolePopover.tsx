import { Question } from '@phosphor-icons/react';
import { Accordion, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { PermissionOptions } from '@waldur/administration/roles/PermissionOptions';
import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const RoleDetailsDialog = ({ role }) => (
  <ModalDialog
    title={translate('Role details: {roleName}', {
      roleName: role.description || role.name,
    })}
  >
    {PermissionOptions.filter((entity) =>
      entity.options.find((option) => role.permissions.includes(option.value)),
    ).map((entity, entityIndex) => (
      <Accordion key={entityIndex}>
        <Card>
          <Accordion.Header>{entity.label}</Accordion.Header>
          <Accordion.Body>
            <ul>
              {entity.options
                .filter((option) => role.permissions.includes(option.value))
                .map((option, optionIndex) => (
                  <li key={optionIndex}>{option.label}</li>
                ))}
            </ul>
          </Accordion.Body>
        </Card>
      </Accordion>
    ))}
  </ModalDialog>
);

export const RolePopover = ({ roleName }) => {
  const role = ENV.roles.find((role) => role.name === roleName);
  const dispatch = useDispatch();
  return (
    <>
      {role?.description || role?.name}{' '}
      <Question
        onClick={() => dispatch(openModalDialog(RoleDetailsDialog, { role }))}
      />
    </>
  );
};
