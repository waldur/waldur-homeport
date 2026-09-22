import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceOfferingMergesCreate,
  marketplaceOfferingMergesPartialUpdate,
  marketplaceOfferingMergesPreview,
  marketplaceOfferingMergesSuggestMappingRetrieve,
  OfferingMerge,
  PatchedOfferingMergeRequest,
} from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProgressStep, VerticalProgressSteps } from '@/wizard';

import {
  LIST_STATE,
  MERGE_QUERY_KEY,
  MERGES_TABLE_ID,
  WIZARD_STATE,
} from '../constants';
import { useMergeOfferings, useOfferingMerge } from '../hooks';
import { InvoicePolicyChoice } from '../InvoicePolicy';
import { getPlanNames } from '../MergeMappingsView';
import {
  getAllowedOfferingTypes,
  getDraftChanges,
  getDraftFromMerge,
  getMergeStateLabel,
  getPresetSuggestion,
  isEditable,
  isPreviewCurrent,
  MergeDraft,
  prefillMappings,
} from '../utils';

import { AnswersStep } from './AnswersStep';
import { MappingStep } from './MappingStep';
import { PreviewStep } from './PreviewStep';
import { RunStep } from './RunStep';
import { getSelectionTypes, MergeSelection, SelectStep } from './SelectStep';

import '@/wizard/wizard.scss';

const STEP_SELECT = 0;
const STEP_PREVIEW = 4;
const STEP_RUN = 5;

const EMPTY_DRAFT: MergeDraft = {
  plan_mapping: {},
  component_mapping: {},
  attribute_key_mapping: {},
  invoice_policy: 'open_month',
};

const getSteps = (): ProgressStep[] => [
  {
    key: 'select',
    label: translate('Select offerings'),
    description: translate('Sources and target'),
    completed: false,
  },
  {
    key: 'mapping',
    label: translate('Map plans and components'),
    description: translate('Where usage and resources land'),
    completed: false,
  },
  {
    key: 'answers',
    label: translate('Map order answers'),
    description: translate('Optional'),
    completed: false,
  },
  {
    key: 'invoices',
    label: translate('Invoice policy'),
    description: translate('Which invoices are rewritten'),
    completed: false,
  },
  {
    key: 'preview',
    label: translate('Preview'),
    description: translate('Blockers and warnings'),
    completed: false,
  },
  {
    key: 'run',
    label: translate('Confirm and run'),
    description: translate('Progress and verification'),
    completed: false,
  },
];

const splitUuids = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((uuid) => uuid.trim())
    .filter(Boolean);

/**
 * Staff wizard for one merge. The record is created after the first step and
 * its uuid and the current step live in the URL, so a reload lands on the
 * same step and resumes polling a running merge.
 */
export const OfferingMergeWizard: FC = () => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();
  const mergeUuid: string | undefined = params.merge || undefined;
  const step = Math.min(Math.max(Number(params.step) || 0, 0), STEP_RUN);

  const setParams = useCallback(
    (patch: Record<string, unknown>) =>
      router.stateService.go(
        WIZARD_STATE,
        { ...params, ...patch },
        { location: 'replace' },
      ),
    [router, params],
  );

  const {
    data: merge,
    isLoading,
    error,
    refetch,
  } = useOfferingMerge(mergeUuid);

  // --- Selection, before a record exists ----------------------------------
  const [selection, setSelection] = useState<MergeSelection>({
    sources: [],
    target: null,
  });
  const presetUuids = useMemo(
    () =>
      mergeUuid
        ? []
        : [...splitUuids(params.sources), ...splitUuids(params.target)],
    [mergeUuid, params.sources, params.target],
  );
  const { data: presetOfferings } = useMergeOfferings(presetUuids);
  const presetApplied = useRef(false);
  useEffect(() => {
    if (presetApplied.current || !presetOfferings) {
      return;
    }
    presetApplied.current = true;
    setSelection({
      sources: splitUuids(params.sources)
        .map((uuid) => presetOfferings[uuid])
        .filter(Boolean),
      target: presetOfferings[params.target] ?? null,
    });
  }, [presetOfferings, params.sources, params.target]);

  // --- Draft of the editable fields, synced from the record ---------------
  const [draft, setDraft] = useState<MergeDraft>(EMPTY_DRAFT);
  const syncedVersion = useRef<string>();
  useEffect(() => {
    if (!merge) {
      return;
    }
    const version = `${merge.uuid}:${merge.modified}`;
    if (syncedVersion.current !== version) {
      syncedVersion.current = version;
      setDraft(getDraftFromMerge(merge));
    }
  }, [merge]);

  // Acknowledgements belong to one preview; a new preview asks again.
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const previewKey = JSON.stringify(merge?.preview?.warnings ?? null);
  useEffect(() => {
    setAcknowledged([]);
  }, [previewKey]);

  // A merge past its editable states opens on the run step.
  const jumped = useRef(false);
  useEffect(() => {
    if (merge && !jumped.current) {
      jumped.current = true;
      if (!isEditable(merge.state) && step !== STEP_RUN) {
        setParams({ step: STEP_RUN });
      }
    }
  }, [merge, step, setParams]);

  const offeringUuids = useMemo(
    () => (merge ? [...merge.sources, merge.target] : []),
    [merge],
  );
  const { data: offerings } = useMergeOfferings(offeringUuids);
  const sourceOfferings = useMemo(
    () =>
      merge && offerings
        ? merge.sources.map((uuid) => offerings[uuid]).filter(Boolean)
        : [],
    [merge, offerings],
  );
  const targetOffering =
    merge && offerings ? offerings[merge.target] : undefined;

  const editable = !merge || isEditable(merge.state);
  const changes: PatchedOfferingMergeRequest = useMemo(
    () => (merge && editable ? getDraftChanges(merge, draft) : {}),
    [merge, editable, draft],
  );
  const unsavedChanges = Object.keys(changes).length > 0;

  // --- Mutations -----------------------------------------------------------
  const recordInvalidations = mergeUuid
    ? [
        { queryKey: MERGE_QUERY_KEY(mergeUuid) },
        { queryKey: ['table', MERGES_TABLE_ID] },
      ]
    : [];

  const createMutation = useManagedMutation<
    OfferingMerge,
    unknown,
    MergeSelection
  >({
    mutationFn: async ({ sources, target }) => {
      const sourceUuids = sources.map((source) => source.uuid);
      const suggestion =
        getPresetSuggestion(
          params.mapping,
          { sources: splitUuids(params.sources), target: params.target },
          { sources: sourceUuids, target: target.uuid },
        ) ??
        (await marketplaceOfferingMergesSuggestMappingRetrieve({
          query: { sources: sourceUuids.join(','), target: target.uuid },
        }).then((response) => response.data));
      const mapping = prefillMappings(suggestion, {
        plan_mapping: {},
        component_mapping: {},
      });
      return marketplaceOfferingMergesCreate({
        body: {
          sources: sourceUuids,
          target: target.uuid,
          ...mapping,
          invoice_policy: 'open_month',
        },
      }).then((response) => response.data);
    },
    successMessage: translate('The merge draft has been created.'),
    errorMessage: translate('Unable to create the merge.'),
    invalidateQueries: [{ queryKey: ['table', MERGES_TABLE_ID] }],
    closeModal: false,
  });

  const saveMutation = useManagedMutation<
    unknown,
    unknown,
    PatchedOfferingMergeRequest
  >({
    mutationFn: (body) =>
      marketplaceOfferingMergesPartialUpdate({
        path: { uuid: mergeUuid },
        body,
      }),
    errorMessage: translate('Unable to save the mappings.'),
    invalidateQueries: recordInvalidations,
    closeModal: false,
  });

  const previewMutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: async () => {
      if (unsavedChanges) {
        await marketplaceOfferingMergesPartialUpdate({
          path: { uuid: mergeUuid },
          body: changes,
        });
      }
      return marketplaceOfferingMergesPreview({ path: { uuid: mergeUuid } });
    },
    errorMessage: translate('Unable to preview the merge.'),
    invalidateQueries: recordInvalidations,
    closeModal: false,
  });

  const suggestionMutation = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      marketplaceOfferingMergesSuggestMappingRetrieve({
        query: { sources: merge.sources.join(','), target: merge.target },
      }).then((response) =>
        setDraft((current) => ({
          ...current,
          ...prefillMappings(response.data, current),
        })),
      ),
    errorMessage: translate('Unable to suggest mappings.'),
    closeModal: false,
  });

  const saveChanges = async () => {
    if (unsavedChanges) {
      await saveMutation.mutateAsync(changes);
    }
  };

  const goToStep = async (target: number) => {
    try {
      await saveChanges();
    } catch {
      return; // the mutation already reported it
    }
    setParams({ step: target });
  };

  const createAndContinue = async () => {
    try {
      const created = (await createMutation.mutateAsync(
        selection,
      )) as OfferingMerge;
      setParams({
        merge: created.uuid,
        step: STEP_SELECT + 1,
        sources: null,
        target: null,
        mapping: null,
      });
    } catch {
      // reported by the mutation
    }
  };

  // --- Rendering -----------------------------------------------------------
  if (mergeUuid && isLoading) {
    return <LoadingSpinner />;
  }
  if (mergeUuid && (error || !merge)) {
    return <LoadingErred loadData={refetch} />;
  }

  const steps = getSteps().map((item, index) => ({
    ...item,
    completed: index < step,
  }));

  const nextDisabledReason = (() => {
    if (step === STEP_SELECT && !merge) {
      if (!selection.sources.length) {
        return translate('Select at least one source offering.');
      }
      if (!selection.target) {
        return translate('Select the target offering.');
      }
      const allowed = getAllowedOfferingTypes(getSelectionTypes(selection));
      if (allowed && allowed.length === 0) {
        return translate('These offering types cannot be merged.');
      }
    }
    if (step === STEP_PREVIEW && !isPreviewCurrent(merge)) {
      return translate('Run the preview first.');
    }
    return undefined;
  })();

  const pending =
    createMutation.isPending ||
    saveMutation.isPending ||
    previewMutation.isPending;

  const renderStep = () => {
    if (step === STEP_SELECT) {
      return (
        <SelectStep
          merge={merge}
          selection={selection}
          onChange={setSelection}
        />
      );
    }
    if (!targetOffering) {
      return <LoadingSpinner />;
    }
    switch (step) {
      case 1:
        return (
          <MappingStep
            sources={sourceOfferings}
            target={targetOffering}
            draft={draft}
            onChange={setDraft}
            disabled={!editable}
            onApplySuggestions={() => suggestionMutation.mutate()}
            applyingSuggestions={suggestionMutation.isPending}
          />
        );
      case 2:
        return (
          <AnswersStep
            sources={sourceOfferings}
            target={targetOffering}
            draft={draft}
            onChange={setDraft}
            disabled={!editable}
          />
        );
      case 3:
        return (
          <InvoicePolicyChoice
            value={draft.invoice_policy}
            onChange={(invoice_policy) =>
              editable && setDraft({ ...draft, invoice_policy })
            }
            toRewriteByPolicy={
              isPreviewCurrent(merge)
                ? merge.preview.invoice_items?.to_rewrite_by_policy
                : undefined
            }
          />
        );
      case STEP_PREVIEW:
        return (
          <PreviewStep
            merge={merge}
            planNames={getPlanNames(offerings)}
            acknowledged={acknowledged}
            onAcknowledge={(code, checked) =>
              setAcknowledged((current) =>
                checked
                  ? [...current, code]
                  : current.filter((item) => item !== code),
              )
            }
            onRunPreview={() => previewMutation.mutate()}
            running={previewMutation.isPending}
          />
        );
      default:
        return (
          <RunStep
            merge={merge}
            acknowledged={acknowledged}
            unsavedChanges={unsavedChanges}
          />
        );
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {merge
            ? translate('Merge into {target} ({state})', {
                target: merge.target_offering?.name,
                state: getMergeStateLabel(merge.state),
              })
            : translate('New offering merge')}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="wizard wizard-vertical d-flex flex-column flex-lg-row gap-7">
          <div className="flex-shrink-0" style={{ width: '280px' }}>
            <VerticalProgressSteps
              steps={steps}
              onClick={(_item, index) => goToStep(index)}
            />
          </div>
          <div className="flex-grow-1 min-w-0">
            {!editable && step > STEP_SELECT && step < STEP_RUN && (
              <p className="text-muted">
                {translate(
                  'The merge is {state}; its mappings can no longer change.',
                  { state: getMergeStateLabel(merge.state) },
                )}
              </p>
            )}
            <div className="wizard-body-vertical">{renderStep()}</div>
            <div className="d-flex justify-content-between mt-5 pt-5 border-top">
              <BaseButton
                label={translate('Back')}
                variant="tertiary"
                iconNode={<CaretLeftIcon weight="bold" />}
                onClick={() => goToStep(step - 1)}
                disabled={step === STEP_SELECT || pending}
                disabledReason={
                  step === STEP_SELECT
                    ? translate('This is the first step.')
                    : undefined
                }
              />
              <div className="d-flex gap-3">
                <BaseButton
                  label={translate('Close')}
                  variant="tertiary"
                  onClick={() => router.stateService.go(LIST_STATE)}
                />
                {step < STEP_RUN && (
                  <BaseButton
                    label={
                      step === STEP_SELECT && !merge
                        ? translate('Create draft')
                        : translate('Next')
                    }
                    variant="primary"
                    iconNode={<CaretRightIcon weight="bold" />}
                    iconRight
                    onClick={() =>
                      step === STEP_SELECT && !merge
                        ? createAndContinue()
                        : goToStep(step + 1)
                    }
                    disabled={Boolean(nextDisabledReason) || pending}
                    disabledReason={nextDisabledReason}
                    pending={pending}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
