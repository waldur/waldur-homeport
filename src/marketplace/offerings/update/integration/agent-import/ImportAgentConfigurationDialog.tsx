import { CaretLeftIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'es-toolkit/compat';
import { FC, useCallback, useMemo, useState } from 'react';
import { marketplaceSiteAgentPluginsList } from 'waldur-js-client';

import { BaseButton, CloseDialogButton, ProgressStep } from 'waldur-ui';
import { WizardStepIndicator } from 'waldur-wizard';

import { UI_STALE_TIME } from '@/core/constants';
import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import {
  AgentConfigurationBlock,
  AgentComponentField,
  AgentConfigurationImport,
  AgentConfigurationUnresolved,
  importAgentConfiguration,
} from './api';
import { FileStep } from './FileStep';
import {
  describeImportRefusal,
  describePreviewErrors,
  getImportOptions,
  getPolicyActionErrors,
  getConfigurationErrors,
  getPlaceholderType,
  getTooLongMessage,
  getSentValues,
  ImportOptions,
  isSameComponentField,
  mergeUnresolved,
  getDefaultBlockIndex,
  listConfigurationBlocks,
} from './importModel';
import { OfferingStep } from './OfferingStep';
import { ReviewStep } from './ReviewStep';

type StepKey = 'File' | 'Offering' | 'Review';

export interface ImportAgentConfigurationDialogProps {
  resolve: {
    offeringUuid: string;
    refetch?(): Promise<any> | void;
  };
}

export const ImportAgentConfigurationDialog: FC<
  ImportAgentConfigurationDialogProps
> = ({ resolve: { offeringUuid, refetch } }) => {
  const { showErrorResponse } = useNotify();
  const [step, setStep] = useState<StepKey>('File');
  const [configuration, setConfiguration] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<AgentConfigurationBlock[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>();
  // The server asked which block to import: the file names no block for
  // this offering, and has several.
  const [blockNotices, setBlockNotices] = useState<string[]>([]);
  const [blockErrors, setBlockErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<AgentConfigurationImport | null>(null);
  const [validation, setValidation] = useState<string[]>([]);
  // Values typed for the settings the file leaves as environment
  // placeholders, by path. They are kept across dry runs, and dropped with
  // the file they belong to.
  const [values, setValues] = useState<Record<string, string>>({});
  // The component fields and the policy to update on the offering too, as
  // chosen on the review.
  const [applyComponents, setApplyComponents] = useState<AgentComponentField[]>(
    [],
  );
  const [applyPolicy, setApplyPolicy] = useState(false);
  // What the policy does when it fires: required when the import creates it.
  const [policyActions, setPolicyActions] = useState<string[]>([]);
  // The server's errors about those actions, shown under their select.
  const [policyActionErrors, setPolicyActionErrors] = useState<string[]>([]);
  // The options (values and choices) the preview on screen was made with.
  const [previewedOptions, setPreviewedOptions] = useState<ImportOptions>({});
  // Every placeholder setting a preview of this file asked for. One stays
  // listed once given a value, whether or not the server still lists it, so
  // the value can be seen and changed.
  const [asked, setAsked] = useState<AgentConfigurationUnresolved[]>([]);
  const [checking, setChecking] = useState(false);

  const hasOfferingStep = blocks.length > 1 || blockNotices.length > 0;

  const steps = useMemo<ProgressStep[]>(
    () =>
      [
        { key: 'File', label: translate('Configuration file') },
        ...(hasOfferingStep
          ? [{ key: 'Offering', label: translate('Offering') }]
          : []),
        { key: 'Review', label: translate('Review') },
      ].map((item) => ({ ...item, completed: false })),
    [hasOfferingStep],
  );
  const currentIndex = steps.findIndex((item) => item.key === step);

  const editConfiguration = useCallback((text: string) => {
    setConfiguration(text);
    setFileErrors(getConfigurationErrors(text));
    setValues({});
    setAsked([]);
    setApplyComponents([]);
    setApplyPolicy(false);
    setPolicyActions([]);
  }, []);

  const changeFile = useCallback((selected: File | null, text: string) => {
    setFile(selected);
    setConfiguration(text);
    setFileErrors(getConfigurationErrors(text));
    setValues({});
    setAsked([]);
    setApplyComponents([]);
    setApplyPolicy(false);
    setPolicyActions([]);
  }, []);

  const changeValue = useCallback(
    (path: string, value: string) =>
      setValues((current) => ({ ...current, [path]: value })),
    [],
  );

  // The plugin catalogue: the types of the backend settings asked for.
  const { data: plugins } = useQuery({
    queryKey: ['site-agent-plugins'],
    queryFn: () =>
      marketplaceSiteAgentPluginsList().then((response) => response.data),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  // What each setting asked for holds, where it is known, so its value is
  // entered with the right control and sent with its type.
  const types = useMemo(
    () =>
      Object.fromEntries(
        asked.map(({ path }) => [
          path,
          getPlaceholderType(path, plugins, preview?.agent_configuration),
        ]),
      ),
    [asked, plugins, preview?.agent_configuration],
  );

  // What a dry run and the import send besides the file and the block: the
  // values typed for the settings asked for, and the choices.
  const options = useMemo(
    () =>
      getImportOptions(
        getSentValues(values, asked, types),
        applyComponents,
        applyPolicy,
        policyActions,
      ),
    [values, asked, types, applyComponents, applyPolicy, policyActions],
  );

  const toggleComponent = useCallback(
    (item: AgentComponentField, checked: boolean) =>
      setApplyComponents((current) => [
        ...current.filter((other) => !isSameComponentField(other, item)),
        ...(checked ? [{ component: item.component, field: item.field }] : []),
      ]),
    [],
  );

  // Another block has settings of its own to ask for. What was typed stays,
  // and fills in a setting of the same path again.
  const selectBlock = useCallback((index: number) => {
    setSelectedIndex(index);
    setAsked([]);
    setApplyComponents([]);
    setApplyPolicy(false);
    setPolicyActions([]);
  }, []);

  // A dry run of the file, of the chosen block when one is given.
  const checkConfiguration = async (offeringIndex?: number) => {
    const fromFile = offeringIndex === undefined;
    setChecking(true);
    setBlockErrors([]);
    try {
      const result = await importAgentConfiguration(offeringUuid, {
        configuration,
        dry_run: true,
        ...(fromFile ? {} : { offering_index: offeringIndex }),
        ...options,
      });
      setPreview(result);
      setPreviewedOptions(options);
      setAsked((current) => mergeUnresolved(current, result.unresolved));
      setValidation(describePreviewErrors(result.errors));
      setPolicyActionErrors(getPolicyActionErrors(result.errors));
      if (fromFile) {
        setBlocks(result.offerings);
        setSelectedIndex(result.selected_index);
        setBlockNotices([]);
        setStep(result.offerings.length > 1 ? 'Offering' : 'Review');
      } else {
        setStep('Review');
      }
    } catch (error) {
      const refusal = describeImportRefusal(error);
      if (!refusal) {
        showErrorResponse(
          error,
          translate('Unable to check the agent configuration.'),
        );
        return;
      }
      if (fromFile) {
        if (refusal.configuration.length) {
          setFileErrors(refusal.configuration);
          return;
        }
        // The server lists the blocks with a request to choose one; else
        // they are read from the file here.
        const found =
          refusal.offerings ??
          listConfigurationBlocks(configuration, offeringUuid);
        setBlocks(found);
        setSelectedIndex(getDefaultBlockIndex(found));
        setPreview(null);
        setBlockNotices(refusal.offeringIndex);
        if (refusal.offeringIndex.length) {
          setValidation([]);
          setStep('Offering');
          return;
        }
        setValidation(refusal.validation);
        setStep(found.length > 1 ? 'Offering' : 'Review');
      } else {
        const blockLines = [...refusal.configuration, ...refusal.offeringIndex];
        if (blockLines.length && step === 'Offering') {
          setBlockErrors(blockLines);
          return;
        }
        if (blockLines.length) {
          setValidation(blockLines);
          return;
        }
        // Refused as a whole, say for a choice the user may not make: on the
        // review the preview stays, so the choice can be undone, and the
        // options stay unchecked.
        if (step !== 'Review') {
          setPreview(null);
        }
        setValidation(refusal.validation);
        setStep('Review');
      }
    } finally {
      setChecking(false);
    }
  };

  const { mutateAsync: apply, isPending: applying } = useManagedMutation<
    unknown,
    any,
    void
  >({
    mutationFn: () =>
      importAgentConfiguration(offeringUuid, {
        configuration,
        offering_index: selectedIndex ?? preview?.selected_index,
        ...options,
        dry_run: false,
      }),
    successMessage: translate('Agent configuration has been imported.'),
    refetch,
    // The offering's refetch brings its components; the policy section reads
    // its own query.
    invalidateQueries: [
      { queryKey: ['site-agent-config', offeringUuid] },
      { queryKey: ['slurm-policies', offeringUuid] },
    ],
    onError: (error) => {
      const refusal = describeImportRefusal(error);
      const lines = refusal
        ? [
            ...refusal.configuration,
            ...refusal.offeringIndex,
            ...refusal.validation,
          ]
        : [];
      if (lines.length) {
        setValidation(lines);
        const body = getErrorBody(error);
        setPolicyActionErrors(
          getPolicyActionErrors(body?.agent_configuration ?? body),
        );
      } else {
        showErrorResponse(
          error,
          translate('Unable to import the agent configuration.'),
        );
      }
    },
  });

  const busy = checking || applying;

  const goBack = () => {
    if (step === 'Review' && hasOfferingStep) {
      setStep('Offering');
    } else {
      setStep('File');
    }
  };

  const goNext = () => {
    if (step === 'File') {
      checkConfiguration();
    } else if (step === 'Offering') {
      checkConfiguration(selectedIndex);
    } else {
      apply().catch(() => undefined);
    }
  };

  // A switch left off is a value: false.
  const missingValues = asked.some(
    ({ path }) => types[path]?.kind !== 'boolean' && !values[path]?.trim(),
  );
  const notChecked = !isEqual(options, previewedOptions);
  const changesNothing =
    !preview?.changes.length && !applyComponents.length && !applyPolicy;

  const missingPolicyActions =
    applyPolicy &&
    Boolean(preview?.policy?.needs_actions) &&
    !policyActions.length;

  const checkAgain = () =>
    checkConfiguration(selectedIndex ?? preview?.selected_index ?? 0);

  const nextDisabledReason =
    step === 'File' && !configuration.trim()
      ? translate('Upload or paste an agent configuration file first.')
      : step === 'File' && getConfigurationErrors(configuration).length
        ? getTooLongMessage()
        : step === 'Offering' && selectedIndex === undefined
          ? translate('Choose the offering to import first.')
          : step !== 'Review'
            ? undefined
            : missingValues
              ? translate(
                  'Fill in the settings the file leaves to the environment first.',
                )
              : missingPolicyActions
                ? translate(
                    'Choose what happens when the periodic usage policy fires first.',
                  )
                : notChecked
                  ? translate(
                      'Check the configuration again with your values and choices first.',
                    )
                  : validation.length
                    ? translate('Fix the errors in the file first.')
                    : changesNothing
                      ? translate(
                          'The file changes nothing in the agent configuration.',
                        )
                      : undefined;

  return (
    <ModalDialog
      title={translate('Import agent configuration')}
      subtitle={translate(
        "Take the agent's settings from its configuration file.",
      )}
      footer={
        <>
          {step !== 'File' && (
            <BaseButton
              label={translate('Back')}
              onClick={goBack}
              iconNode={<CaretLeftIcon weight="bold" />}
              disabled={busy}
              disabledReason={translate('Submission in progress')}
              className="min-w-dialog-action"
              variant="tertiary"
              size="lg"
            />
          )}
          <CloseDialogButton
            className="ms-auto"
            disabled={applying}
            disabledReason={translate('Submission in progress')}
          />
          <BaseButton
            label={step === 'Review' ? translate('Import') : translate('Next')}
            onClick={goNext}
            variant="primary"
            className="min-w-dialog-action"
            size="lg"
            pending={busy}
            disabled={busy || Boolean(nextDisabledReason)}
            disabledReason={nextDisabledReason}
            data-testid={
              step === 'Review' ? 'import-button' : 'import-next-button'
            }
          />
        </>
      }
    >
      <WizardStepIndicator
        steps={steps}
        value={steps[currentIndex]}
        onClick={(target, index) => {
          // Only back: a later step needs the dry run the Next button runs.
          if (index < currentIndex) {
            setStep(target.key as StepKey);
          }
        }}
        disabled={busy}
      />
      {step === 'File' ? (
        <FileStep
          configuration={configuration}
          file={file}
          errors={fileErrors}
          disabled={busy}
          onConfigurationChange={editConfiguration}
          onFileChange={changeFile}
          onErrors={setFileErrors}
        />
      ) : step === 'Offering' ? (
        <OfferingStep
          blocks={blocks}
          selectedIndex={selectedIndex}
          notices={blockNotices}
          errors={blockErrors}
          disabled={busy}
          onSelect={selectBlock}
        />
      ) : (
        <ReviewStep
          preview={preview}
          errors={validation}
          unresolved={asked}
          types={types}
          values={values}
          applyComponents={applyComponents}
          applyPolicy={applyPolicy}
          stale={notChecked}
          checking={checking}
          onToggleComponent={toggleComponent}
          onApplyPolicyChange={setApplyPolicy}
          policyActions={policyActions}
          policyActionErrors={policyActionErrors}
          onPolicyActionsChange={setPolicyActions}
          onValueChange={changeValue}
          onCheckAgain={checkAgain}
        />
      )}
    </ModalDialog>
  );
};
