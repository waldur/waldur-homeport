import { QuestionIcon } from '@phosphor-icons/react';
import { Accordion, Card } from 'react-bootstrap';

import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@/table/constants';

const RoleDetailsDialog = ({ role }) => (
  <ModalDialog
    title={translate('Role details: {roleName}', {
      roleName: role?.description || role?.name,
    })}
  >
    {PermissionOptions.filter((entity) =>
      entity.options.find((option) =>
        (role?.permissions || []).includes(option.value),
      ),
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
  const { openDialog } = useModal();
  if (!role) {
    // A role the cache does not know: deleted, or private to an organization
    // the viewer cannot see. There are no details to open, and the dialog would
    // render an empty body titled "Role details: undefined" - formatTemplate
    // interpolates a missing value as the literal string.
    return <>{roleName}</>;
  }
  return (
    <>
      {role.description || role.name}{' '}
      <QuestionIcon
        size={12}
        weight="bold"
        onClick={() => openDialog(RoleDetailsDialog, { role })}
      />
    </>
  );
};

export const exportRoleField = (row) => {
  const role = ENV.roles.find((role) => role.name === row.role_name);
  return role?.description || role?.name || DASH_ESCAPE_CODE;
};
