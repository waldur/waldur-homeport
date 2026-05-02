import { useCallback, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { Field, getFormValues, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  marketplaceScriptAsyncDryRunRetrieve,
  marketplaceScriptDryRunAsyncRun,
  MergedSecretOptionsRequest,
} from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Tip } from '@/core/Tooltip';
import { wait } from '@/core/utils';
import { SubmitButton } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { ScriptEditorHeader } from './ScriptEditorHeader';
import { ScriptEditorProps } from './types';

import './EditScriptDialog.scss';

type OwnProps = { resolve: ScriptEditorProps };

export const EditScriptDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: {
    script: ownProps.resolve.offering.secret_options[ownProps.resolve.type],
  },
}))(
  reduxForm<{}, OwnProps>({
    form: EDIT_SCRIPT_FORM_ID,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
  })((props) => {
    const [initialSecretOptions, setInitialSecretOptions] = useState<
      Offering['secret_options']
    >(props.resolve.offering.secret_options);
    const [scriptOption, setScriptOption] = useState<{
      label;
      type;
      dry_run;
    }>({
      label: props.resolve.label,
      type: props.resolve.type,
      dry_run: props.resolve.dry_run,
    });

    const { showError, showErrorResponse, showSuccess } = useNotify();

    const { closeDialog: closeModal, confirm } = useModal();

    const [executing, setExecuting] = useState<boolean>(false);
    const [scriptExecutionResult, setScriptExecutionResult] = useState('');
    const language = props.resolve.offering.secret_options.language;
    const formValues = useSelector(getFormValues(EDIT_SCRIPT_FORM_ID)) as {
      script;
    };

    // We need to check isDirty manually, because redux-form dirty does not work correctly when form is reinitialized
    const isDirty = useMemo(
      () =>
        String(formValues.script) !==
        String(initialSecretOptions[scriptOption.type]),
      [formValues, initialSecretOptions, scriptOption],
    );

    const changeScript = async (option) => {
      if (option.type === scriptOption.type) return;
      let switchAllowed = true;
      if (isDirty) {
        switchAllowed = false;
        try {
          await confirm(
            translate('Unsaved changes'),
            translate(
              'Switching scripts will discard your changes. Do you want to continue?',
            ),
            {
              size: 'sm',
              negativeButton: translate('Discard and switch'),
              positiveButton: translate('Stay on current'),
            },
          );
        } catch {
          switchAllowed = true;
        }
      }
      if (switchAllowed) {
        setScriptOption(option);
        props.initialize({
          script: initialSecretOptions[option.type],
        });
      }
    };

    // Simulate reset
    const resetScript = () => {
      // Since the current script type is the key of MonacoField,
      // switch it to update the field value and ui
      const scriptType = scriptOption.type;
      setScriptOption({ ...scriptOption, type: '' });
      setTimeout(() => {
        setScriptOption({ ...scriptOption, type: scriptType });
      });

      props.reset();
    };

    const closeDialog = async () => {
      if (isDirty) {
        try {
          await confirm(
            translate('Unsaved changes'),
            translate('Do you want to save or discard changes?'),
            {
              size: 'sm',
              negativeButton: translate('Discard and exit'),
              positiveButton: translate('Save changes'),
            },
          );
        } catch {
          closeModal();
          return;
        }
        handleSaveAndExit();
      } else {
        closeModal();
      }
    };

    const updateScript = useCallback(
      async (formData) => {
        try {
          const secret_options = {
            ...initialSecretOptions,
            [scriptOption.type]: formData.script ? formData.script : null,
          } as MergedSecretOptionsRequest;
          await marketplaceProviderOfferingsUpdateIntegration({
            path: { uuid: props.resolve.offering.uuid },
            body: { secret_options },
          });
          setInitialSecretOptions(secret_options);
          props.initialize({ script: formData.script });
          showSuccess(translate('Script has been updated successfully.'));
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          return true;
        } catch (error) {
          showErrorResponse(error, translate('Unable to update script.'));
          return false;
        }
      },
      [scriptOption, initialSecretOptions],
    );

    const handleSave = props.handleSubmit(updateScript);

    const handleSaveAndExit = (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) event.preventDefault();
      handleSave().then((res) => {
        if (res) closeModal();
      });
    };

    const pollAsyncDryRunResult = async (dryRunUuid: string) => {
      let asyncDryRunResult: any;
      setExecuting(true);
      do {
        asyncDryRunResult = await marketplaceScriptAsyncDryRunRetrieve({
          path: { uuid: dryRunUuid },
        });
        if (asyncDryRunResult.data.get_state_display === 'erred') {
          break;
        }
        await wait(3000);
      } while (asyncDryRunResult.data.get_state_display !== 'done');
      setExecuting(false);
      return asyncDryRunResult;
    };

    const handleSaveAndRunScript = async () => {
      const planUrl = props.resolve.offering?.plans?.length
        ? props.resolve.offering.plans[0].url
        : null;
      // Save the script if it is changed
      if (isDirty) {
        await handleSave();
      }
      try {
        const response: any = await marketplaceScriptDryRunAsyncRun({
          path: { uuid: props.resolve.offering.uuid },
          body: {
            plan: planUrl,
            type: scriptOption.dry_run,
          },
        });

        const asyncDryRunResult: any = await pollAsyncDryRunResult(
          response.data.uuid,
        );
        if (asyncDryRunResult.data.get_state_display === 'erred') {
          showError(translate('An error occurred during script execution.'));
        } else {
          showSuccess(
            translate('{type} script was executed successfully', {
              type: scriptOption.dry_run,
            }),
          );
        }
        setScriptExecutionResult(asyncDryRunResult.data.output);
      } catch (e) {
        showErrorResponse(
          e,
          translate('{type} script got an error', {
            type: scriptOption.dry_run,
          }),
        );
      }
    };

    return (
      <form onSubmit={handleSaveAndExit} className="script-editor">
        <ModalDialog
          title={
            language
              ? translate('Manage custom scripts ({language})', { language })
              : translate('Manage custom scripts')
          }
          closeButton
          onHide={closeDialog}
          bodyClassName="py-0"
          extraClassName="editor-header gap-4 py-5"
          extra={
            !language ? (
              <Tip
                id="resource-action-dialog-disabled-tooltip"
                label={translate(
                  'Please select a script language to use dry-run',
                )}
              >
                <ActionButton
                  variant="secondary"
                  disabled
                  disabledReason={translate('Read-only mode')}
                  action={() => {}}
                  title={translate('Save & dry run script')}
                />
              </Tip>
            ) : (
              <ScriptEditorHeader
                offering={props.resolve.offering}
                script={scriptOption}
                onDryRun={handleSaveAndRunScript}
                onSave={handleSave}
                onReset={resetScript}
                onChangeScript={changeScript}
                submitting={props.submitting}
                executing={executing}
                dirty={isDirty}
              />
            )
          }
          footer={
            <div className="flex-grow-1">
              <AccordionCard
                title={translate('Console output')}
                solid
                className="mb-5"
                titleClassName="fs-6"
              >
                {scriptExecutionResult ? (
                  <pre className="text-primary mb-0">
                    {scriptExecutionResult}
                  </pre>
                ) : (
                  <i className="text-muted">{translate('Nothing to show')}</i>
                )}
              </AccordionCard>
              <div className="d-flex justify-content-end gap-4">
                <ActionButton
                  variant="tertiary"
                  action={closeDialog}
                  disabled={props.submitting}
                  disabledReason={translate('Submission in progress')}
                  title={translate('Cancel')}
                />
                <SubmitButton
                  disabled={props.invalid || !isDirty}
                  submitting={props.submitting}
                  label={translate('Save and exit')}
                />
              </div>
            </div>
          }
        >
          <Card className="card-bordered card-solid">
            <Card.Header>
              <h6 className="mb-0">{translate('Code editor')}</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Field
                key={scriptOption.type}
                name="script"
                required={true}
                language={props.resolve.offering.secret_options.language}
                component={MonacoField}
                height={450}
              />
            </Card.Body>
          </Card>
        </ModalDialog>
      </form>
    );
  }),
);
