import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  microAppSettingsCreate,
  microAppSettingsDestroy,
  microAppSettingsPartialUpdate,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { FEATURE_RULES_QUERY_KEY } from '@/administration/feature-rules/utils';
import { required } from '@/core/validators';
import { RadioGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  choiceOf,
  getChoiceLabel,
  MICRO_APP_SETTINGS_QUERY_KEY,
  MicroAppChoice,
  MicroAppRow,
} from './utils';

const CHOICES: MicroAppChoice[] = ['feature', 'off', 'all', 'audience'];

const choiceDescription = (choice: MicroAppChoice) =>
  ({
    feature: translate(
      'Listed for the users the app is meant for while the micro-apps feature is on, as before settings existed',
    ),
    off: translate(
      'Never listed, and opening it shows that it is not available',
    ),
    all: translate('Listed for everyone the app is meant for'),
    audience: translate(
      'Listed only for the users its rules match, among those the app is meant for',
    ),
  })[choice];

interface MicroAppModeDialogProps {
  resolve: { row: MicroAppRow; refetch?: () => void };
}

export const MicroAppModeDialog: FC<MicroAppModeDialogProps> = ({
  resolve: { row, refetch },
}) => {
  const current = choiceOf(row);
  const save = useManagedMutation<any, any, { choice: MicroAppChoice }>({
    mutationFn: ({ choice }) => {
      if (choice === 'feature') {
        return microAppSettingsDestroy({ path: { uuid: row.setting.uuid } });
      }
      if (row.setting) {
        return microAppSettingsPartialUpdate({
          path: { uuid: row.setting.uuid },
          body: { mode: choice },
        });
      }
      return microAppSettingsCreate({ body: { name: row.name, mode: choice } });
    },
    successMessage: translate('Micro-app setting has been saved.'),
    errorMessage: translate('Unable to save the micro-app setting.'),
    refetch,
    invalidateQueries: [
      { queryKey: MICRO_APP_SETTINGS_QUERY_KEY },
      { queryKey: FEATURE_RULES_QUERY_KEY },
    ],
  });

  return (
    <Form<{ choice: MicroAppChoice }>
      onSubmit={(values) => save.mutateAsync(values)}
      initialValues={{ choice: current }}
      render={({ handleSubmit, submitting, values, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Who gets {app}', { app: row.title })}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  disabled={pristine}
                  label={translate('Save')}
                  variant="primary"
                />
              </>
            }
          >
            <RadioGroup
              name="choice"
              label={translate('Offered to')}
              choices={CHOICES.map((choice) => ({
                value: choice,
                label: getChoiceLabel(choice),
                description: choiceDescription(choice),
              }))}
              validate={required}
              required
            />
            {values.choice === 'feature' && row.setting?.rules_count ? (
              <AlertItem
                variant="warning"
                type="floating"
                title={translate(
                  'The {count} rules that pick its users will be deleted',
                  { count: row.setting.rules_count },
                )}
              />
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
