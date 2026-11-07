import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CallPanel,
  proposalProtectedCallsListUsersList,
  proposalProtectedCallsPanelsSet,
  proposalProtectedCallsPanelsUpdate,
  scienceDomainsList,
  scienceSubDomainsList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoleEnum } from '@/permissions/enums';

import { Call } from '../../types';

export interface CallPanelFormValues {
  name: string;
  description: string;
  order: number;
  science_domains: string[];
  science_sub_domains: string[];
  members: string[];
  chair: string | null;
}

interface Option {
  uuid: string;
  label: string;
}

const domainLabel = (domain: { code?: string; name: string }) =>
  domain.code ? `${domain.code} ${domain.name}` : domain.name;

/**
 * The request body for a panel. The chair must be one of the members: a
 * chair dropped from the members is dropped as chair too, rather than
 * refused.
 */
export const panelRequestBody = (values: CallPanelFormValues) => {
  const members = values.members ?? [];
  return {
    name: values.name.trim(),
    description: values.description ?? '',
    order: Number(values.order) || 0,
    science_domains: values.science_domains ?? [],
    science_sub_domains: values.science_sub_domains ?? [],
    members,
    chair: values.chair && members.includes(values.chair) ? values.chair : null,
  };
};

export const CallPanelFormDialog = ({
  resolve,
}: {
  resolve: { call: Call; panel?: CallPanel; refetch(): void };
}) => {
  const { call, panel, refetch } = resolve;
  const isEdit = Boolean(panel);

  const { data: domains = [], isLoading: loadingDomains } = useQuery({
    queryKey: ['CallPanelDomains'],
    queryFn: () =>
      scienceDomainsList({ query: { page_size: 200 } }).then(({ data }) =>
        data.map((d) => ({ uuid: d.uuid, label: domainLabel(d) })),
      ),
    staleTime: 5 * 60 * 1000,
  });
  const { data: subDomains = [], isLoading: loadingSubDomains } = useQuery({
    queryKey: ['CallPanelSubDomains'],
    queryFn: () =>
      scienceSubDomainsList({ query: { page_size: 500 } }).then(({ data }) =>
        data.map((d) => ({ uuid: d.uuid, label: domainLabel(d) })),
      ),
    staleTime: 5 * 60 * 1000,
  });
  // Only the call's panel members can sit on one of its panels.
  const { data: panelMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['CallPanelMembers', call.uuid],
    queryFn: () =>
      proposalProtectedCallsListUsersList({
        path: { uuid: call.uuid },
        query: { role: [RoleEnum.CALL_PANEL_MEMBER], page_size: 200 },
      }).then(({ data }) =>
        data.map((role) => ({
          uuid: role.user_uuid,
          label: role.user_full_name || role.user_username,
        })),
      ),
  });

  const initialValues = useMemo<CallPanelFormValues>(
    () => ({
      name: panel?.name ?? '',
      description: panel?.description ?? '',
      order: panel?.order ?? 0,
      science_domains: panel?.science_domains ?? [],
      science_sub_domains: panel?.science_sub_domains ?? [],
      members: panel?.members ?? [],
      chair: panel?.chair ?? null,
    }),
    [panel],
  );

  const mutation = useManagedMutation<any, any, CallPanelFormValues>({
    mutationFn: (values) => {
      const body = panelRequestBody(values);
      return isEdit
        ? proposalProtectedCallsPanelsUpdate({
            path: { uuid: call.uuid, obj_uuid: panel.uuid },
            body,
          })
        : proposalProtectedCallsPanelsSet({
            path: { uuid: call.uuid },
            body,
          });
    },
    successMessage: isEdit
      ? translate('The panel has been updated.')
      : translate('The panel has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update the panel.')
      : translate('Unable to add the panel.'),
    refetch,
  });

  return (
    <Form<CallPanelFormValues>
      initialValues={initialValues}
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const chairOptions: Option[] = panelMembers.filter((member) =>
          (values.members ?? []).includes(member.uuid),
        );
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={isEdit ? translate('Edit panel') : translate('Add panel')}
              subtitle={translate(
                "A proposal goes to the panel covering its science sub-domain, or else its domain, when its evaluation starts. Evaluator roles for the proposal's panel are held by its chair or members.",
              )}
              iconNode={!isEdit ? <PlusCircleIcon weight="bold" /> : null}
              iconColor={isEdit ? 'warning' : 'success'}
              footer={
                <>
                  <CloseDialogButton className="min-w-[125px]" />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={isEdit ? translate('Update') : translate('Add')}
                    variant="primary"
                    className="min-w-[125px]"
                  />
                </>
              }
            >
              <StringGroup
                name="name"
                label={translate('Name')}
                required={true}
                validate={required}
                maxLength={255}
              />
              <TextGroup
                name="description"
                label={translate('Description')}
                rows={2}
              />
              <SelectGroup
                name="science_domains"
                label={translate('Science domains')}
                description={translate(
                  'Proposals of these domains go to this panel. A domain goes to one panel only.',
                )}
                options={domains}
                getOptionValue={(option: Option) => option.uuid}
                getOptionLabel={(option: Option) => option.label}
                isMulti={true}
                simpleValue={true}
                isLoading={loadingDomains}
                isClearable={true}
              />
              <SelectGroup
                name="science_sub_domains"
                label={translate('Science sub-domains')}
                description={translate(
                  'Proposals of these sub-domains go to this panel, whichever panel their domain goes to.',
                )}
                options={subDomains}
                getOptionValue={(option: Option) => option.uuid}
                getOptionLabel={(option: Option) => option.label}
                isMulti={true}
                simpleValue={true}
                isLoading={loadingSubDomains}
                isClearable={true}
              />
              <SelectGroup
                name="members"
                label={translate('Members')}
                description={translate(
                  "Chosen from the call's panel members, added in the Team tab.",
                )}
                options={panelMembers}
                getOptionValue={(option: Option) => option.uuid}
                getOptionLabel={(option: Option) => option.label}
                isMulti={true}
                simpleValue={true}
                isLoading={loadingMembers}
                isClearable={true}
              />
              <SelectGroup
                name="chair"
                label={translate('Chair')}
                description={translate(
                  "One of the panel's members. Takes the evaluator roles held by the chair of a proposal's panel.",
                )}
                options={chairOptions}
                getOptionValue={(option: Option) => option.uuid}
                getOptionLabel={(option: Option) => option.label}
                simpleValue={true}
                isClearable={true}
              />
              <NumberGroup
                name="order"
                label={translate('Position')}
                description={translate('Panels are listed by position.')}
                min={0}
              />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
