import { useQuery } from '@tanstack/react-query';
import {
  CallNotificationMailType,
  callWorkflowStepNotificationRulesList,
  CallWorkflowStepNotificationRule,
  NotificationPreview,
  proposalProtectedCallsNotificationMailTypesList,
  proposalProtectedCallsNotificationPreviewRetrieve,
  proposalProtectedCallsRetrieve,
  rolesList,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

/** What a mail dialog shows: a rule's cell, or a mail type. */
export interface MailTarget {
  step?: string;
  stepName?: string;
  trigger?: string;
  recipient?: string;
  daysBefore?: number | null;
  mailType?: string;
  variant?: string;
}

const mailPreviewKey = (callUuid: string, target?: MailTarget) =>
  ['callMailPreview', callUuid, target] as const;

export const mailTypesKey = (callUuid: string) =>
  ['callMailTypes', callUuid] as const;

export const stepRulesKey = (callUuid: string, step?: string) =>
  ['callStepNotificationRules', callUuid, step] as const;

export const previewQuery = (target: MailTarget) =>
  target.step
    ? {
        step: target.step,
        trigger: target.trigger as any,
        recipient: target.recipient as any,
        ...(target.daysBefore != null
          ? { days_before: target.daysBefore }
          : {}),
      }
    : { mail_type: target.mailType, variant: target.variant ?? '' };

/**
 * Retry a preview the backend turned away as busy (429): it renders one
 * preview of a call at a time, and a page may ask for two at once.
 */
export const retryBusyPreview = (failureCount: number, error: any) =>
  (error?.status ?? error?.response?.status) === 429 && failureCount < 5;

/** The mail as the call would send it, on a synthetic proposal. */
export const useMailPreview = (callUuid: string, target: MailTarget) =>
  useQuery<NotificationPreview>({
    queryKey: mailPreviewKey(callUuid, target),
    queryFn: () =>
      proposalProtectedCallsNotificationPreviewRetrieve({
        path: { uuid: callUuid },
        query: previewQuery(target),
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
    retry: retryBusyPreview,
    retryDelay: 600,
    meta: OWN_ERROR_STATE,
  });

/** Every mail type the call may word itself, with its own wording. */
export const useMailTypes = (callUuid: string) =>
  useQuery<CallNotificationMailType[]>({
    queryKey: mailTypesKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsNotificationMailTypesList({
        path: { uuid: callUuid },
      }).then((response) => response.data ?? []),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** The notification rules of one step of the call. */
export const useStepRules = (callUuid: string, step?: string) =>
  useQuery<CallWorkflowStepNotificationRule[]>({
    queryKey: stepRulesKey(callUuid, step),
    queryFn: () =>
      callWorkflowStepNotificationRulesList({
        query: { call_uuid: callUuid, step, page_size: 100 },
      }).then((response) => response.data ?? []),
    enabled: Boolean(step),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** The proposal roles an applicant rule may narrow its audience to. */
export const useProposalTeamRoles = () =>
  useQuery({
    queryKey: ['proposalTeamRoles'],
    queryFn: () =>
      rolesList({
        query: { content_type: 'proposal', is_active: true, page_size: 50 },
      }).then((response) => response.data ?? []),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

/** The call, shared with the call's edit page. */
export const useCallForMail = (callUuid: string) =>
  useQuery({
    queryKey: ['CallUpdateContainer', callUuid],
    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: callUuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
