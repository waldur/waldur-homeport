import { FieldArray } from 'redux-form';

import { translate } from '@/i18n';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { RulesList } from './RulesList';
import { connectForm } from './utils';

export const RulesForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resource,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Set rules in {name} security group', {
          name: resource.name,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <FieldArray
            name="rules"
            component={RulesList}
            remoteSecurityGroups={asyncState.value}
          />
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
