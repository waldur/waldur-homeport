import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Field, Form } from 'react-final-form';
import {
  CallTemplatePreset,
  callTemplatesLoadPreset,
  callTemplatesPresetsList,
} from 'waldur-js-client';

import {
  AccordionCard,
  Badge,
  BaseButton,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
} from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BooleanGroup, SubmitButton } from '@/form';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CallTemplateStepsPreview } from '@/proposals/templates/CallTemplateStepsPreview';
import { useNotify } from '@/store/notify';

import {
  groupPresets,
  isEmptyCatalogue,
  PresetProgrammeGroup,
} from './presetCatalogue';

interface LoadPresetValues {
  presets: string[];
  publish: boolean;
}

// One object for every render: a new one would reset the selection whenever
// the dialog re-renders, such as on each keystroke in the search box.
const INITIAL_VALUES: LoadPresetValues = { presets: [], publish: false };

const PresetOption: FC<{
  preset: CallTemplatePreset;
  checked: boolean;
  onChange(checked: boolean): void;
}> = ({ preset, checked, onChange }) => {
  const [showSteps, setShowSteps] = useState(false);
  const info = preset.preset;
  const summary = info?.summary || preset.description;
  return (
    <div
      className="border border-secondary rounded-lg p-3"
      data-testid="call-template-preset"
    >
      <Checkbox
        checked={!preset.name_taken && checked}
        disabled={preset.name_taken}
        onCheckedChange={onChange}
        label={
          <span className="inline-flex gap-1.5 items-center flex-wrap">
            {info?.process || preset.name}
            {preset.name_taken ? (
              <Badge variant="neutral" tone="outline">
                {translate('Name in use')}
              </Badge>
            ) : null}
          </span>
        }
        description={
          summary || preset.name_taken ? (
            // A disabled checkbox's summary is still what tells the presets
            // apart: it keeps the readable colour rather than the disabled
            // control's 1.5:1 one.
            <span className="text-[var(--check-description)]">
              {summary}
              {preset.name_taken ? (
                <span className="block mt-1" data-testid="preset-name-taken">
                  {translate(
                    'A call template named {name} already exists: rename or delete it to load this preset again.',
                    { name: preset.name },
                  )}
                </span>
              ) : null}
            </span>
          ) : undefined
        }
      />
      {info?.tags?.length || info?.reference_url ? (
        <div className="mt-1.5 ms-6 flex gap-1.5 flex-wrap items-center">
          {info.tags?.map((tag) => (
            <Badge key={tag} variant="neutral" size="sm" tone="outline">
              {tag}
            </Badge>
          ))}
          {info.reference_url ? (
            <ExternalLink
              url={info.reference_url}
              label={translate('Reference')}
              className="text-xs"
            />
          ) : null}
        </div>
      ) : null}
      {preset.steps.length ? (
        <Collapsible
          className="mt-1.5 ms-6"
          open={showSteps}
          onOpenChange={setShowSteps}
        >
          <CollapsibleTrigger asChild>
            <BaseButton
              variant="text-primary"
              label={
                showSteps
                  ? translate('Hide workflow')
                  : translate('Show workflow ({count} steps)', {
                      count: preset.steps.length,
                    })
              }
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2.5">
              <CallTemplateStepsPreview steps={preset.steps} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
};

interface SelectionProps {
  selected: string[];
  onChange(selected: string[]): void;
}

const PresetList: FC<SelectionProps & { presets: CallTemplatePreset[] }> = ({
  presets,
  selected,
  onChange,
}) => (
  <div className="flex flex-col gap-2.5">
    {presets.map((preset) => (
      <PresetOption
        key={preset.key}
        preset={preset}
        checked={selected.includes(preset.key)}
        onChange={(checked) =>
          onChange(
            checked
              ? [...selected, preset.key]
              : selected.filter((key) => key !== preset.key),
          )
        }
      />
    ))}
  </div>
);

const ProgrammeGroup: FC<
  SelectionProps & {
    group: PresetProgrammeGroup;
    isOpen: boolean;
    onToggle(isOpen: boolean): void;
  }
> = ({ group, selected, onChange, isOpen, onToggle }) => {
  const { programme, presets } = group;
  const selectable = presets
    .filter((preset) => !preset.name_taken)
    .map((preset) => preset.key);
  const allSelected =
    selectable.length > 0 && selectable.every((key) => selected.includes(key));
  return (
    <div
      data-testid="call-template-preset-programme"
      aria-label={programme.name}
      role="group"
    >
      <AccordionCard
        size="sm"
        secondary
        isOpen={isOpen}
        onToggle={onToggle}
        title={
          <span className="inline-flex gap-1.5 items-center flex-wrap">
            {programme.name}
            <Badge variant="neutral" size="sm" tone="outline">
              {translate('{count} processes', { count: presets.length })}
            </Badge>
          </span>
        }
        subtitle={programme.summary || undefined}
        actions={
          <>
            {programme.organization_url ? (
              <ExternalLink
                url={programme.organization_url}
                label={programme.organization}
                className="text-xs"
              />
            ) : (
              <span className="text-xs text-quaternary">
                {programme.organization}
              </span>
            )}
            <BaseButton
              variant="text-primary"
              size="sm"
              disabled={!selectable.length}
              disabledReason={translate(
                'A call template already holds the name of every preset of this programme.',
              )}
              label={
                allSelected
                  ? translate('Clear selection')
                  : translate('Select all')
              }
              aria-label={
                allSelected
                  ? translate('Clear the selection of {programme}', {
                      programme: programme.name,
                    })
                  : translate('Select all of {programme}', {
                      programme: programme.name,
                    })
              }
              onClick={() =>
                onChange(
                  allSelected
                    ? selected.filter((key) => !selectable.includes(key))
                    : [
                        ...selected,
                        ...selectable.filter((key) => !selected.includes(key)),
                      ],
                )
              }
            />
          </>
        }
      >
        {programme.reference_url ? (
          <div className="mb-2.5">
            <ExternalLink
              url={programme.reference_url}
              label={translate('About the programme')}
              className="text-xs"
            />
          </div>
        ) : null}
        <PresetList presets={presets} selected={selected} onChange={onChange} />
      </AccordionCard>
    </div>
  );
};

export const CallTemplateLoadPresetDialog: FC<{
  resolve: { refetch(): void };
}> = ({ resolve }) => {
  const {
    data: presets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['call-template-presets'],
    queryFn: () => callTemplatesPresetsList().then((response) => response.data),
    staleTime: 0,
  });

  const [query, setQuery] = useState('');
  const catalogue = useMemo(
    () => groupPresets(presets ?? [], query),
    [presets, query],
  );
  // Programmes start folded; a search unfolds every programme it matches.
  const [openProgrammes, setOpenProgrammes] = useState<string[]>([]);
  const isProgrammeOpen = (key: string) =>
    Boolean(query.trim()) || openProgrammes.includes(key);
  const toggleProgramme = (key: string, isOpen: boolean) =>
    setOpenProgrammes((keys) =>
      isOpen ? [...keys, key] : keys.filter((item) => item !== key),
    );

  const { showSuccess } = useNotify();
  const mutation = useManagedMutation({
    mutationFn: (values: LoadPresetValues) =>
      callTemplatesLoadPreset({
        body: { presets: values.presets, publish: values.publish },
      }),
    errorMessage: translate('Unable to load call template presets.'),
    refetch: resolve.refetch,
    onSuccess: (response) =>
      showSuccess(
        translate('Loaded {count} call templates.', {
          count: response.data.created,
        }),
      ),
  });

  return (
    <Form<LoadPresetValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={INITIAL_VALUES}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={<DownloadSimpleIcon weight="bold" />}
            iconColor="info"
            title={translate('Load call template presets')}
            subtitle={translate(
              'Presets are starting points shipped with this portal. Each one loaded becomes a call template of its own, which keeps no link to the preset.',
            )}
            footer={
              <SubmitButton
                disabled={!values.presets.length || submitting}
                disabledReason={
                  presets && presets.every((preset) => preset.name_taken)
                    ? translate(
                        'A call template already holds the name of every preset.',
                      )
                    : translate('Select at least one preset.')
                }
                submitting={submitting}
                label={translate('Load')}
              />
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                message={translate('Unable to load call template presets.')}
                loadData={refetch}
              />
            ) : (
              <>
                <FilterBox
                  type="search"
                  className="mb-3"
                  placeholder={translate(
                    'Search by name, programme, organization or tag',
                  )}
                  aria-label={translate('Search presets')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Field<string[]> name="presets">
                  {({ input }) => (
                    <div className="flex flex-col gap-5 mb-5">
                      {isEmptyCatalogue(catalogue) ? (
                        <EmptyState
                          message={translate('No presets match the search.')}
                        />
                      ) : null}
                      {catalogue.generic.length ? (
                        <section
                          aria-label={translate('Generic patterns')}
                          data-testid="call-template-preset-category"
                        >
                          <h3 className="text-sm font-medium mb-1">
                            {translate('Generic patterns')}
                          </h3>
                          <p className="text-quaternary text-xs mb-2.5">
                            {translate(
                              'Evaluation processes any organization can adopt.',
                            )}
                          </p>
                          <PresetList
                            presets={catalogue.generic}
                            selected={input.value}
                            onChange={input.onChange}
                          />
                        </section>
                      ) : null}
                      {catalogue.programmes.length ? (
                        <section
                          aria-label={translate('Programmes')}
                          data-testid="call-template-preset-category"
                        >
                          <h3 className="text-sm font-medium mb-1">
                            {translate('Programmes')}
                          </h3>
                          <p className="text-quaternary text-xs mb-2.5">
                            {translate(
                              'Processes modeled on the calls of a named programme.',
                            )}
                          </p>
                          <div className="flex flex-col gap-2.5">
                            {catalogue.programmes.map((group) => (
                              <ProgrammeGroup
                                key={group.programme.key}
                                group={group}
                                selected={input.value}
                                onChange={input.onChange}
                                isOpen={isProgrammeOpen(group.programme.key)}
                                onToggle={(isOpen) =>
                                  toggleProgramme(group.programme.key, isOpen)
                                }
                              />
                            ))}
                          </div>
                        </section>
                      ) : null}
                      {catalogue.other.length ? (
                        <section
                          aria-label={translate('Other presets')}
                          data-testid="call-template-preset-category"
                        >
                          <h3 className="text-sm font-medium mb-2.5">
                            {translate('Other presets')}
                          </h3>
                          <PresetList
                            presets={catalogue.other}
                            selected={input.value}
                            onChange={input.onChange}
                          />
                        </section>
                      ) : null}
                    </div>
                  )}
                </Field>
                <BooleanGroup
                  name="publish"
                  label={translate('Publish after loading')}
                  description={translate(
                    'Published templates are offered to every call manager.',
                  )}
                  spaceless
                />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

export const CallTemplateLoadPresetButton: FC<{ refetch(): void }> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      label={translate('Load preset')}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      onClick={() =>
        openDialog(CallTemplateLoadPresetDialog, {
          resolve: { refetch },
          size: 'lg',
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};
