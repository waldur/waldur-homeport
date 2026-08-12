import { useQuery } from '@tanstack/react-query';
import {
  PatchedProviderCannedResponseRequest,
  PatchedProviderHelpdeskRequest,
  ProviderCannedResponseRequest,
  providerCannedResponsesCreate,
  providerCannedResponsesDestroy,
  providerCannedResponsesPartialUpdate,
  PatchedProviderSupportUserRequest,
  ProviderHelpdeskRequest,
  providerHelpdesksCreate,
  providerHelpdesksDestroy,
  providerHelpdesksPartialUpdate,
  providerHelpdesksValidate,
  ProviderSupportUserRequest,
  providerSupportUsersCreate,
  providerSupportUsersDestroy,
  providerSupportUsersList,
  providerSupportUsersPartialUpdate,
  providerSupportUsersTeamWorkloadList,
  providerTicketsAssign,
  providerTicketsClaim,
  providerTicketsResolve,
  providerTicketsStatsRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

// --- Queries ---

/** Aggregate ticket stats for the current user's provider helpdesk. */
export const useProviderTicketsStats = () =>
  useQuery({
    queryKey: ['ProviderTicketsStats'],
    queryFn: () =>
      providerTicketsStatsRetrieve().then((response) => response.data),
  });

/** Active support-team members for a helpdesk (assignee options + team page). */
export const useProviderTeam = (helpdeskUuid?: string) =>
  useQuery({
    queryKey: ['ProviderTeam', helpdeskUuid],
    queryFn: () =>
      providerSupportUsersList({
        query: {
          provider_helpdesk_uuid: helpdeskUuid,
          is_active: true,
          page_size: 200,
        },
      }).then((response) => response.data ?? []),
    enabled: Boolean(helpdeskUuid),
  });

/** Per-member workload (open tickets vs capacity). */
export const useTeamWorkload = (helpdeskUuid?: string) =>
  useQuery({
    queryKey: ['ProviderTeamWorkload', helpdeskUuid],
    queryFn: () =>
      providerSupportUsersTeamWorkloadList({
        query: { provider_helpdesk_uuid: helpdeskUuid },
      }).then((response) => response.data ?? []),
    enabled: Boolean(helpdeskUuid),
  });

// --- Ticket actions ---

interface AssignTicketVars {
  uuid: string;
  provider_support_user: string;
}

export const useAssignTicket = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, AssignTicketVars>({
    mutationFn: (variables) =>
      providerTicketsAssign({
        path: { uuid: variables.uuid },
        body: { provider_support_user: variables.provider_support_user },
      }),
    successMessage: translate('Ticket assigned.'),
    errorMessage: translate('Unable to assign ticket.'),
    closeModal: false,
    refetch,
  });

export const useClaimTicket = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerTicketsClaim({ path: { uuid: variables.uuid } }),
    successMessage: translate('Ticket claimed.'),
    errorMessage: translate('Unable to claim ticket.'),
    closeModal: false,
    refetch,
  });

export const useResolveTicket = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerTicketsResolve({ path: { uuid: variables.uuid } }),
    successMessage: translate('Ticket resolved.'),
    errorMessage: translate('Unable to resolve ticket.'),
    closeModal: false,
    refetch,
  });

// --- Team management ---

export const useCreateSupportUser = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, ProviderSupportUserRequest>({
    mutationFn: (body) => providerSupportUsersCreate({ body }),
    successMessage: translate('Team member added.'),
    errorMessage: translate('Unable to add team member.'),
    refetch,
  });

export const useUpdateSupportUser = (refetch?: () => void) =>
  useManagedMutation<
    unknown,
    unknown,
    { uuid: string; body: PatchedProviderSupportUserRequest }
  >({
    mutationFn: (variables) =>
      providerSupportUsersPartialUpdate({
        path: { uuid: variables.uuid },
        body: variables.body,
      }),
    successMessage: translate('Team member updated.'),
    errorMessage: translate('Unable to update team member.'),
    closeModal: false,
    refetch,
  });

export const useDeleteSupportUser = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerSupportUsersDestroy({ path: { uuid: variables.uuid } }),
    successMessage: translate('Team member removed.'),
    errorMessage: translate('Unable to remove team member.'),
    closeModal: false,
    refetch,
  });

// --- Helpdesk configuration ---

export const useCreateHelpdesk = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, ProviderHelpdeskRequest>({
    mutationFn: (body) => providerHelpdesksCreate({ body }),
    successMessage: translate('Helpdesk created.'),
    errorMessage: translate('Unable to create helpdesk.'),
    refetch,
  });

export const useUpdateHelpdesk = (refetch?: () => void) =>
  useManagedMutation<
    unknown,
    unknown,
    { uuid: string; body: PatchedProviderHelpdeskRequest }
  >({
    mutationFn: (variables) =>
      providerHelpdesksPartialUpdate({
        path: { uuid: variables.uuid },
        body: variables.body,
      }),
    successMessage: translate('Helpdesk updated.'),
    errorMessage: translate('Unable to update helpdesk.'),
    refetch,
  });

export const useDeleteHelpdesk = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerHelpdesksDestroy({ path: { uuid: variables.uuid } }),
    successMessage: translate('Helpdesk deleted.'),
    errorMessage: translate('Unable to delete helpdesk.'),
    closeModal: false,
    refetch,
  });

export const useValidateHelpdesk = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerHelpdesksValidate({ path: { uuid: variables.uuid } }),
    successMessage: translate('Helpdesk connection validated.'),
    errorMessage: translate('Helpdesk validation failed.'),
    closeModal: false,
    refetch,
  });

// --- Canned responses ---

export const useCreateCannedResponse = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, ProviderCannedResponseRequest>({
    mutationFn: (body) => providerCannedResponsesCreate({ body }),
    successMessage: translate('Canned response created.'),
    errorMessage: translate('Unable to create canned response.'),
    refetch,
  });

export const useUpdateCannedResponse = (refetch?: () => void) =>
  useManagedMutation<
    unknown,
    unknown,
    { uuid: string; body: PatchedProviderCannedResponseRequest }
  >({
    mutationFn: (variables) =>
      providerCannedResponsesPartialUpdate({
        path: { uuid: variables.uuid },
        body: variables.body,
      }),
    successMessage: translate('Canned response updated.'),
    errorMessage: translate('Unable to update canned response.'),
    refetch,
  });

export const useDeleteCannedResponse = (refetch?: () => void) =>
  useManagedMutation<unknown, unknown, { uuid: string }>({
    mutationFn: (variables) =>
      providerCannedResponsesDestroy({ path: { uuid: variables.uuid } }),
    successMessage: translate('Canned response deleted.'),
    errorMessage: translate('Unable to delete canned response.'),
    closeModal: false,
    refetch,
  });
