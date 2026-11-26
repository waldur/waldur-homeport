import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderResourcesSetOptionSecret,
  marketplaceResourcesSetOptionSecret,
  Resource,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { composeValidators, required } from '@/core/validators';
import { FormGroup } from '@/form';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import { SecretOptionField } from '@/marketplace/common/SecretOptionField';
import {
  SecretPolicy,
  validateSecretValue,
} from '@/marketplace/common/secretOptions';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

export interface OptionSecretDialogProps {
  resolve: {
    resource: Pick<Resource, 'uuid' | 'name'>;
    optionName: string;
    optionLabel: string;
    policy?: SecretPolicy;
    /** Through the provider's endpoint, which records the provider as the source. */
    asProvider?: boolean;
    refetch?: () => void;
  };
}

/**
 * Sets, or replaces, the value of a secret option. It goes straight to the
 * server, which stores it encrypted and answers only whether it is set.
 */
export const SetOptionSecretDialog: FC<OptionSecretDialogProps> = ({
  resolve: { resource, optionName, optionLabel, policy, asProvider, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { value: string }>({
    mutationFn: ({ value }) => {
      const options = {
        path: { uuid: resource.uuid },
        body: { option_name: optionName, value },
      };
      return asProvider
        ? marketplaceProviderResourcesSetOptionSecret(options)
        : marketplaceResourcesSetOptionSecret(options);
    },
    successMessage: translate('The secret has been set.'),
    errorMessage: translate('Unable to set the secret.'),
    refetch,
  });
  return (
    <Form
      onSubmit={async (values: { value: string }) => {
        try {
          await mutation.mutateAsync(values);
        } catch (error) {
          // The server's reason, which never echoes the value, next to it.
          const body = getErrorBody(error);
          const reason = body?.value || body?.option_name;
          return reason ? { value: reason } : undefined;
        }
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialogFinal
          title={translate('Set secret')}
          subtitle={
            <ScopeSubtitle
              label={translate('Option')}
              name={`${optionLabel} · ${resource.name}`}
            />
          }
          submitLabel={translate('Set')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
        >
          <FormGroup
            label={optionLabel}
            description={translate(
              'It replaces the current value, if there is one.',
            )}
            required
          >
            <Field
              name="value"
              validate={composeValidators(required, (value) =>
                validateSecretValue(value, policy, { asProvider }),
              )}
              render={(props) => (
                <SecretOptionField
                  {...props}
                  field={{ default_configs: policy }}
                  alwaysInput
                />
              )}
            />
            <FormFieldError name="value" />
          </FormGroup>
        </ActionDialogFinal>
      )}
    />
  );
};
