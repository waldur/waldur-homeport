import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingTemplatesLoadPreset,
  marketplaceOfferingTemplatesPresetsList,
  OfferingTemplatePreset,
} from 'waldur-js-client';

import {
  Badge,
  BaseButton,
  Checkbox,
  Code,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BooleanGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { OfferingTemplateParametersTable } from './OfferingTemplateParametersTable';

interface LoadPresetValues {
  presets: string[];
  publish: boolean;
}

// One object for every render: a new one would reset the selection whenever
// the dialog re-renders.
const INITIAL_VALUES: LoadPresetValues = { presets: [], publish: false };

const PresetOption: FC<{
  preset: OfferingTemplatePreset;
  checked: boolean;
  onChange(checked: boolean): void;
}> = ({ preset, checked, onChange }) => {
  const [showParameters, setShowParameters] = useState(false);
  return (
    <div
      className="border border-secondary rounded-lg p-3"
      data-testid="offering-template-preset"
    >
      <Checkbox
        checked={!preset.name_taken && checked}
        disabled={preset.name_taken}
        onCheckedChange={onChange}
        label={
          <span className="inline-flex gap-1.5 items-center flex-wrap">
            {preset.name}
            <Code className="text-xs" data-testid="preset-key">
              {preset.key}
            </Code>
            <Badge variant="neutral" size="sm">
              {getLabel(preset.offering_type)}
            </Badge>
            {preset.name_taken ? (
              <Badge variant="neutral">{translate('Name in use')}</Badge>
            ) : null}
          </span>
        }
        description={
          preset.description || preset.name_taken ? (
            // A disabled checkbox's description still tells the presets
            // apart: it keeps the readable colour.
            <span className="text-[var(--check-description)]">
              {preset.description}
              {preset.name_taken ? (
                <span className="block mt-1" data-testid="preset-name-taken">
                  {translate(
                    'An offering template named {name} already exists: rename or delete it to load this preset again.',
                    { name: preset.name },
                  )}
                </span>
              ) : null}
            </span>
          ) : undefined
        }
      />
      {preset.parameters.length ? (
        <Collapsible
          className="mt-1.5 ms-6"
          open={showParameters}
          onOpenChange={setShowParameters}
        >
          <CollapsibleTrigger asChild>
            <BaseButton
              variant="text-primary"
              label={
                showParameters
                  ? translate('Hide parameters')
                  : translate('Show parameters ({count})', {
                      count: preset.parameters.length,
                    })
              }
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2.5">
              <OfferingTemplateParametersTable parameters={preset.parameters} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
};

export const OfferingTemplateLoadPresetDialog: FC<{
  resolve: { refetch(): void };
}> = ({ resolve }) => {
  const {
    data: presets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['offering-template-presets'],
    queryFn: () =>
      marketplaceOfferingTemplatesPresetsList().then(
        (response) => response.data,
      ),
    staleTime: 0,
  });

  const { showSuccess } = useNotify();
  const mutation = useManagedMutation({
    mutationFn: (values: LoadPresetValues) =>
      marketplaceOfferingTemplatesLoadPreset({
        body: { presets: values.presets, publish: values.publish },
      }),
    errorMessage: translate('Unable to load offering template presets.'),
    refetch: resolve.refetch,
    onSuccess: (response) =>
      showSuccess(
        response.data.created === 1
          ? translate('Loaded 1 offering template.')
          : translate('Loaded {count} offering templates.', {
              count: response.data.created,
            }),
      ),
  });

  return (
    <Form<LoadPresetValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={INITIAL_VALUES}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={<DownloadSimpleIcon weight="bold" />}
            iconColor="info"
            title={translate('Load offering template presets')}
            subtitle={translate(
              'Presets are starting points shipped with this portal. Each one loaded becomes an offering template of its own, which keeps no link to the preset.',
            )}
            footer={
              <SubmitButton
                disabled={!values.presets.length || submitting}
                disabledReason={
                  presets?.length &&
                  presets.every((preset) => preset.name_taken)
                    ? translate(
                        'An offering template already holds the name of every preset.',
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
                message={translate('Unable to load offering template presets.')}
                loadData={refetch}
              />
            ) : (
              <>
                <Field<string[]> name="presets">
                  {({ input }) => (
                    <div className="flex flex-col gap-2.5 mb-5">
                      {presets?.length ? (
                        presets.map((preset) => (
                          <PresetOption
                            key={preset.key}
                            preset={preset}
                            checked={input.value.includes(preset.key)}
                            onChange={(checked) =>
                              input.onChange(
                                checked
                                  ? [...input.value, preset.key]
                                  : input.value.filter(
                                      (key) => key !== preset.key,
                                    ),
                              )
                            }
                          />
                        ))
                      ) : (
                        <EmptyState
                          message={translate('This portal ships no presets.')}
                        />
                      )}
                    </div>
                  )}
                </Field>
                <BooleanGroup
                  name="publish"
                  label={translate('Publish after loading')}
                  description={translate(
                    'Published templates are offered to every service provider.',
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

export const OfferingTemplateLoadPresetButton: FC<{ refetch(): void }> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      label={translate('Load preset')}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      onClick={() =>
        openDialog(OfferingTemplateLoadPresetDialog, {
          resolve: { refetch },
          size: 'lg',
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};
