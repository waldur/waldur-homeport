import { FunctionComponent } from 'react';
import { FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';

export const OwnerGroup: FunctionComponent<{
  disabled;
  canChangeRole;
  canManageOwner;
}> = ({ disabled, canChangeRole, canManageOwner }) => (
  <FormGroup>
    <div className="checkbox">
      <label>
        <Field
          name="is_owner"
          component="input"
          type="checkbox"
          disabled={disabled || !canChangeRole || !canManageOwner}
        />
        {formatRole(RoleEnum.CUSTOMER_OWNER)}{' '}
        {(!canChangeRole || !canManageOwner) && (
          <Tip
            id="form-field-tooltip"
            label={
              !canChangeRole
                ? translate('You cannot change your own role.')
                : !canManageOwner
                ? translate('You cannot manage other {role}.', {
                    role: formatRole(RoleEnum.CUSTOMER_OWNER),
                  })
                : ''
            }
          >
            <i className="fa fa-question-circle" />
          </Tip>
        )}
      </label>
    </div>
  </FormGroup>
);
