import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsCoiConfigurationPartialUpdate,
  proposalProtectedCallsCoiConfigurationRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BooleanGroup, NumberGroup, SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

export type COIFieldType = 'number' | 'boolean' | 'array' | 'select';

export interface EditCOISettingProps {
  call: Call;
  name: string;
  title: string;
  label: string;
  description?: string;
  type: COIFieldType;
  refetch: () => void;
}

interface Props {
  resolve: EditCOISettingProps;
}

const fetchCOIConfiguration = async (callUuid: string) => {
  const response = await proposalProtectedCallsCoiConfigurationRetrieve({
    path: { uuid: callUuid },
  });
  return response.data;
};

// Proposal disclosure level options for invitations
const DISCLOSURE_LEVEL_OPTIONS = [
  { value: 'titles_only', label: translate('Titles only') },
  { value: 'titles_and_summaries', label: translate('Titles and summaries') },
  { value: 'full_details', label: translate('Full proposal details') },
];

// COI type options based on backend COITypes enum
const COI_TYPE_OPTIONS = [
  // Real conflicts (must recuse)
  { value: 'INST_SAME', label: translate('Same institution') },
  { value: 'FIN_DIRECT', label: translate('Direct financial interest') },
  { value: 'REL_FAMILY', label: translate('Family relationship') },
  { value: 'ROLE_NAMED', label: translate('Named on proposal') },
  { value: 'COLLAB_ACTIVE', label: translate('Active collaboration') },
  { value: 'REL_MENTOR', label: translate('Mentor/mentee relationship') },
  { value: 'REL_SUPERVISOR', label: translate('Supervisor relationship') },
  // Apparent conflicts (requires management)
  { value: 'COAUTH_RECENT', label: translate('Recent co-authorship') },
  { value: 'INST_DEPT', label: translate('Same department') },
  { value: 'INST_FORMER', label: translate('Former institution') },
  { value: 'ROLE_CONF', label: translate('Conference organizer') },
  { value: 'COLLAB_GRANT', label: translate('Grant collaboration') },
  { value: 'REL_EDITORIAL', label: translate('Editorial relationship') },
  { value: 'COMPET', label: translate('Competitor') },
  // Potential conflicts (disclosure only)
  { value: 'COAUTH_OLD', label: translate('Distant co-authorship') },
  { value: 'INST_CONSORT', label: translate('Consortium membership') },
  { value: 'CONF_ATTEND', label: translate('Conference participation') },
  { value: 'SOC_MEMBER', label: translate('Professional society') },
];

export const EditCOISettingDialog = ({ resolve }: Props) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['coiConfiguration', resolve.call.uuid],
    queryFn: () => fetchCOIConfiguration(resolve.call.uuid),
  });

  const isArrayField = resolve.type === 'array';

  // For array fields, convert to Select options format
  const initialValues = useMemo(() => {
    if (!config) return {};
    const value = config[resolve.name];
    if (isArrayField && Array.isArray(value)) {
      return {
        [resolve.name]: value.map((v) =>
          COI_TYPE_OPTIONS.find((opt) => opt.value === v),
        ),
      };
    }
    return { [resolve.name]: value };
  }, [config, isArrayField, resolve.name]);

  const processRequest = useCallback(
    async (values: Record<string, any>) => {
      let value = values[resolve.name];

      // Convert Select options back to array of values
      if (isArrayField && Array.isArray(value)) {
        value = value.map((opt: { value: string }) => opt.value);
      }

      const body = { [resolve.name]: value };

      try {
        await proposalProtectedCallsCoiConfigurationPartialUpdate({
          path: { uuid: resolve.call.uuid },
          body: body as any,
        });
        // Invalidate all queries with this key to refresh parent component
        await queryClient.invalidateQueries({
          queryKey: ['coiConfiguration', resolve.call.uuid],
        });
        showSuccess(translate('COI setting has been updated.'));
        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update COI setting.'));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to update COI setting.') };
      }
    },
    [resolve, isArrayField, queryClient],
  );

  // Wait for config to load before rendering form to ensure initial values are set
  if (isLoading) {
    return (
      <ModalDialog title={resolve.title}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title}
            footer={
              <>
                <SubmitButton
                  disabled={invalid || isLoading}
                  submitting={submitting}
                  label={translate('Save')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              {resolve.type === 'number' && (
                <NumberGroup
                  name={resolve.name}
                  label={resolve.label}
                  description={resolve.description}
                  min={1}
                  max={10}
                />
              )}
              {resolve.type === 'boolean' && (
                <BooleanGroup name={resolve.name} label={resolve.label} />
              )}
              {resolve.type === 'array' && (
                <SelectGroup
                  name={resolve.name}
                  label={resolve.label}
                  description={resolve.description}
                  options={COI_TYPE_OPTIONS}
                  isMulti
                  placeholder={translate('Select COI types...')}
                />
              )}
              {resolve.type === 'select' && (
                <SelectGroup
                  name={resolve.name}
                  label={resolve.label}
                  description={resolve.description}
                  options={
                    resolve.name === 'invitation_proposal_disclosure'
                      ? DISCLOSURE_LEVEL_OPTIONS
                      : []
                  }
                  simpleValue
                  placeholder={translate('Select an option...')}
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
