import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import {
  ScienceDomainPreset,
  scienceDomainsLoadPreset,
  scienceDomainsPresetsList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroupFinal, SubmitButton } from '@/form';
import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

const LoadPresetDialog = ({ resolve }) => {
  const { showSuccess } = useNotify();

  const [presets, setPresets] = useState<ScienceDomainPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scienceDomainsPresetsList()
      .then((response) => setPresets(response.data))
      .finally(() => setLoading(false));
  }, []);

  const loadPresetMutation = useManagedMutation<
    any,
    any,
    { preset: ScienceDomainPreset }
  >({
    mutationFn: (values) =>
      scienceDomainsLoadPreset({
        body: { preset: values.preset.name as 'cscs' | 'oecd_fos_2007' },
      }),
    errorMessage: translate('Unable to load science domain preset.'),
    refetch: resolve.refetch,
    onSuccess: (response) => {
      showSuccess(
        translate(
          'Created {domains} domains and {subdomains} sub-domains, skipped {skippedDomains} domains and {skippedSubdomains} sub-domains.',
          {
            domains: response.data.created_domains,
            subdomains: response.data.created_subdomains,
            skippedDomains: response.data.skipped_domains,
            skippedSubdomains: response.data.skipped_subdomains,
          },
        ),
      );
    },
  });

  return (
    <Form<{ preset: ScienceDomainPreset }>
      onSubmit={(values) => loadPresetMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={<DownloadSimpleIcon weight="bold" />}
            iconColor="info"
            title={translate('Load science domain preset')}
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={translate('Load')}
              />
            }
          >
            <Field
              name="preset"
              component={FormGroupFinal}
              label={translate('Preset')}
              required
              validate={required}
            >
              <SelectField
                options={presets}
                getOptionValue={(option) => option.name}
                getOptionLabel={(option) => option.label}
                isLoading={loading}
                isClearable
                placeholder={translate('Select a preset...')}
              />
            </Field>
            {values.preset && (
              <p className="text-muted mb-0">{values.preset.description}</p>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};

export const ScienceDomainLoadPresetButton = ({ refetch }) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      title={translate('Load preset')}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      action={() => {
        openDialog(LoadPresetDialog, {
          resolve: { refetch },
        });
      }}
      variant="outline btn-outline-default"
    />
  );
};
