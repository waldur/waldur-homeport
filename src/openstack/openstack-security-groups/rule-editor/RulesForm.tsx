import { FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RulesList } from './RulesList';
import { connectForm } from './utils';

export const RulesForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resourceName,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Set rules in {name} security group', {
          name: resourceName,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={submitting}
              disabled={asyncState.loading || invalid}
              label={translate('Submit')}
            />
          </>
        }
      >
        {asyncState.loading ? (
          <LoadingSpinner />
        ) : asyncState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <FieldArray
            name="rules"
            component={RulesList}
            remoteSecurityGroups={asyncState.value}
          />
        )}
      </ModalDialog>
    </form>
  ),
);
