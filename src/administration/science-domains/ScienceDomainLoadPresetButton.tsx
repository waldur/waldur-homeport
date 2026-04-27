import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  ScienceDomainPreset,
  scienceDomainsLoadPreset,
  scienceDomainsPresetsList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { openModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

const LoadPresetDialog = ({ resolve }) => {
  const dispatch = useDispatch();
  const [presets, setPresets] = useState<ScienceDomainPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scienceDomainsPresetsList()
      .then((response) => setPresets(response.data))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (values: { preset: ScienceDomainPreset }) => {
    try {
      const response = await scienceDomainsLoadPreset({
        body: { preset: values.preset.name as 'cscs' | 'oecd_fos_2007' },
      });
      resolve.refetch();
      dispatch(
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
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to load science domain preset.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={<DownloadSimpleIcon weight="bold" />}
            iconColor="info"
            title={translate('Load science domain preset')}
            closeButton
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
              component={FormGroup as any}
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
  const dispatch = useDispatch();

  const openDialog = useCallback(() => {
    dispatch(
      openModalDialog(LoadPresetDialog, {
        resolve: { refetch },
      }),
    );
  }, [dispatch, refetch]);

  return (
    <ActionButton
      title={translate('Load preset')}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      action={openDialog}
      variant="outline btn-outline-default"
    />
  );
};
