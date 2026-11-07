import { CopyIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  callTemplatesPartialUpdate,
  callTemplatesRetrieve,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { saveFile } from '@/core/saveFile';
import { required } from '@/core/validators';
import { FormGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { namedScenario, scenarioKey } from './checks';

interface FormValues {
  name: string;
  key?: string;
  description?: string;
}

interface SaveScenarioDialogProps {
  resolve: {
    /** The dry run's path as a scenario, still unnamed. */
    draft: Record<string, any>;
    /** The template the call was created from, when staff may add to it. */
    templateUuid?: string | null;
    templateName?: string | null;
  };
}

/**
 * The current dry-run path as a named scenario. Staff add it to the
 * template the call was created from; anyone else exports it as JSON for
 * staff to add.
 */
export const SaveScenarioDialog: FC<SaveScenarioDialogProps> = ({
  resolve: { draft, templateUuid, templateName },
}) => {
  const { showSuccess } = useNotify();
  const { mutate, isPending } = useManagedMutation({
    mutationFn: async (scenario: Record<string, any>) => {
      const { data: template } = await callTemplatesRetrieve({
        path: { uuid: templateUuid! },
      });
      const scenarios = (template.scenarios ?? []).filter(
        (existing) => existing.key !== scenario.key,
      );
      return callTemplatesPartialUpdate({
        path: { uuid: templateUuid! },
        body: { scenarios: [...scenarios, scenario] },
      });
    },
    successMessage: translate('The scenario was added to the template.'),
    errorMessage: translate('Unable to add the scenario to the template.'),
    invalidateQueries: [{ queryKey: ['callWorkflowScenarios'] }],
  });
  const initialValues = useMemo<FormValues>(() => ({ name: '' }), []);
  return (
    <Form<FormValues>
      onSubmit={(values) => mutate(namedScenario(draft, values))}
      initialValues={initialValues}
      render={({ handleSubmit, values, invalid }) => {
        const scenario = namedScenario(draft, values);
        const json = JSON.stringify(scenario, null, 2);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Save as scenario')}
              subtitle={
                templateUuid
                  ? translate(
                      'The path and where it ended, as a scenario of {template}: it runs whenever the template changes.',
                      { template: templateName ?? '' },
                    )
                  : translate(
                      'The path and where it ended, as a scenario. Send the JSON to staff to add it to a template.',
                    )
              }
              footer={
                <div className="flex flex-wrap gap-2.5">
                  <CloseDialogButton />
                  <BaseButton
                    variant="tertiary"
                    label={translate('Copy JSON')}
                    iconNode={<CopyIcon weight="bold" />}
                    disabled={invalid}
                    disabledReason={translate('Name the scenario first.')}
                    onClick={() =>
                      navigator.clipboard
                        .writeText(json)
                        .then(() => showSuccess(translate('Scenario copied.')))
                    }
                  />
                  <BaseButton
                    variant="tertiary"
                    label={translate('Download JSON')}
                    iconNode={<DownloadSimpleIcon weight="bold" />}
                    disabled={invalid}
                    disabledReason={translate('Name the scenario first.')}
                    onClick={() =>
                      saveFile(
                        new Blob([json], { type: 'application/json' }),
                        `${scenario.key || 'scenario'}.json`,
                      )
                    }
                  />
                  {templateUuid && (
                    <SubmitButton
                      submitting={isPending}
                      disabled={invalid}
                      label={translate('Add to the template')}
                    />
                  )}
                </div>
              }
            >
              <StringGroup
                name="name"
                label={translate('Name')}
                validate={required}
                required
                maxLength={150}
                placeholder={translate('Rejected at the administrative check')}
              />
              <StringGroup
                name="key"
                label={translate('Key')}
                description={translate(
                  'Saving a scenario with the key of an existing one replaces it.',
                )}
                maxLength={64}
                placeholder={scenarioKey(values.name || '')}
              />
              <TextGroup name="description" label={translate('Description')} />
              <FormGroup
                label={translate('Assertions')}
                description={translate(
                  'Where the path ended: the proposal state, every step reached and the mail each role received.',
                )}
                spaceless
              >
                <pre
                  className="p-2.5 bg-tertiary dark:bg-quaternary rounded-lg text-xs mb-0"
                  style={{ maxHeight: 240, overflow: 'auto' }}
                  data-testid="scenario-json"
                >
                  {json}
                </pre>
              </FormGroup>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
