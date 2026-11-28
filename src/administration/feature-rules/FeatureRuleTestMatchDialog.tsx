import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { FeatureRule, featureRulesTestMatch } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { FilterOutcomeTable } from '@/administration/rules/FilterOutcomeTable';
import { required } from '@/core/validators';
import { AsyncSelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface FeatureRuleTestMatchDialogProps {
  /** `back` reopens the rules list this dialog was opened from. */
  resolve: { rule: FeatureRule; featureLabel: string; back?: () => void };
}

export const FeatureRuleTestMatchDialog: FC<
  FeatureRuleTestMatchDialogProps
> = ({ resolve }) => {
  const mutation = useMutation({
    mutationFn: async (userUuid: string) =>
      (
        await featureRulesTestMatch({
          path: { uuid: resolve.rule.uuid },
          body: { user_uuid: userUuid },
        })
      ).data,
  });
  const result = mutation.data;

  return (
    <Form
      onSubmit={(values: any) => mutation.mutate(values.user.uuid)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Test rule for {feature}', {
              feature: resolve.featureLabel,
            })}
            footer={
              <>
                <CloseDialogButton
                  label={resolve.back ? translate('Back') : undefined}
                  onClick={resolve.back}
                />
                <SubmitButton
                  disabled={invalid || mutation.isPending}
                  submitting={mutation.isPending}
                  label={translate('Run test')}
                  variant="primary"
                />
              </>
            }
          >
            <AsyncSelectGroup
              label={translate('Target user')}
              name="user"
              validate={required}
              onChange={() => mutation.reset()}
              loadOptions={userAutocomplete}
              defaultOptions
              placeholder={translate('Search by name, email or username...')}
              isClearable
              getOptionLabel={(option) =>
                option.full_name || option.email || option.username || ''
              }
              getOptionValue={(option) => option.uuid}
            />
            {mutation.error ? (
              <AlertItem
                variant="error"
                type="floating"
                title={translate('Test failed: {error}', {
                  error:
                    (mutation.error as Error).message ||
                    translate('Unknown error'),
                })}
                className="mt-2.5"
              />
            ) : null}
            {result ? (
              <div className="mt-3" data-testid="feature-rule-test-result">
                <div className="mb-2.5 flex items-center gap-1.5">
                  {result.matched ? (
                    <CheckCircleIcon
                      size={24}
                      weight="bold"
                      className="text-success"
                    />
                  ) : (
                    <XCircleIcon
                      size={24}
                      weight="bold"
                      className="text-danger"
                    />
                  )}
                  <span
                    className={`text-base font-medium ${result.matched ? 'text-success' : 'text-danger'}`}
                  >
                    {result.matched
                      ? translate('Matches {user}', {
                          user: result.user_username,
                        })
                      : translate('Does not match {user}', {
                          user: result.user_username,
                        })}
                  </span>
                </div>
                {result.matched && !result.is_active ? (
                  <AlertItem
                    variant="warning"
                    type="floating"
                    title={translate(
                      'The rule is inactive, so it turns nothing on until it is activated',
                    )}
                    className="mb-2.5"
                  />
                ) : null}
                {result.enabled_globally ? (
                  <AlertItem
                    variant="info"
                    type="floating"
                    title={translate(
                      'The feature is already on for everyone, so this rule changes nothing',
                    )}
                    className="mb-2.5"
                  />
                ) : null}
                <FilterOutcomeTable results={result.filters} />
              </div>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
