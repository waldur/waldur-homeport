import { useQuery } from '@tanstack/react-query';
import {
  callTemplatesWorkflowDescriptionRetrieve,
  proposalProposalsWorkflowTimelineRetrieve,
  proposalProtectedCallsWorkflowCheckRetrieve,
  proposalProtectedCallsWorkflowDescriptionRetrieve,
  proposalProtectedCallsWorkflowDiffRetrieve,
  proposalProtectedCallsWorkflowPathsRetrieve,
  proposalProtectedCallsWorkflowProgressRetrieve,
  proposalProtectedCallsWorkflowVersionsList,
  WorkflowCheck,
  WorkflowDescription,
  WorkflowDiff,
  WorkflowPaths,
  WorkflowProgress,
  WorkflowTimeline,
  WorkflowVersion,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

export const callWorkflowDescriptionKey = (callUuid: string) =>
  ['callWorkflowDescription', callUuid] as const;

/**
 * The call's workflow description: readable by the call's team, staff and
 * support only. Anyone else is answered 404, which must not take them off
 * the page they are on.
 */
export const useCallWorkflowDescription = (callUuid: string, enabled = true) =>
  useQuery<WorkflowDescription>({
    queryKey: callWorkflowDescriptionKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsWorkflowDescriptionRetrieve({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** A call template's workflow description. */
export const useTemplateWorkflowDescription = (
  templateUuid: string | undefined,
) =>
  useQuery<WorkflowDescription>({
    queryKey: ['callTemplateWorkflowDescription', templateUuid],
    queryFn: () =>
      callTemplatesWorkflowDescriptionRetrieve({
        path: { uuid: templateUuid! },
      }).then((response) => response.data),
    enabled: Boolean(templateUuid),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

export const callWorkflowCheckKey = (callUuid: string) =>
  ['callWorkflowCheck', callUuid] as const;

/**
 * The call's workflow check: errors that stop activation, warnings and
 * notes. Readable by the description's audience only; anyone else is
 * answered 404, shown as nothing.
 */
export const useCallWorkflowCheck = (callUuid: string, enabled = true) =>
  useQuery<WorkflowCheck>({
    queryKey: callWorkflowCheckKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsWorkflowCheckRetrieve({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

export const callWorkflowHistoryKey = (callUuid: string) =>
  ['callWorkflowHistory', callUuid] as const;

/** The call's recorded workflow versions, oldest first. */
export const useCallWorkflowVersions = (callUuid: string, enabled = true) =>
  useQuery<WorkflowVersion[]>({
    queryKey: [...callWorkflowHistoryKey(callUuid), 'versions'],
    queryFn: () =>
      proposalProtectedCallsWorkflowVersionsList({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/**
 * The changes between two versions of the call's workflow: a version
 * number, `current`, `template` (the version the call was created from) or
 * `template_latest`.
 */
export const useCallWorkflowDiff = (
  callUuid: string,
  from: string,
  to: string,
  enabled = true,
) =>
  useQuery<WorkflowDiff>({
    queryKey: [...callWorkflowHistoryKey(callUuid), 'diff', from, to],
    queryFn: () =>
      proposalProtectedCallsWorkflowDiffRetrieve({
        path: { uuid: callUuid },
        query: { from, to },
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled && Boolean(from) && Boolean(to),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** How the call's proposals move through its workflow, per step: for the
 * call's team, staff and support; 404 for anyone else. */
export const useCallWorkflowProgress = (
  callUuid: string,
  roundUuid: string | null,
  enabled = true,
) =>
  useQuery<WorkflowProgress>({
    queryKey: ['callWorkflowProgress', callUuid, roundUuid],
    queryFn: () =>
      proposalProtectedCallsWorkflowProgressRetrieve({
        path: { uuid: callUuid },
        query: roundUuid ? { round: roundUuid } : undefined,
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** The distinct paths the call's proposals took. */
export const useCallWorkflowPaths = (
  callUuid: string,
  roundUuid: string | null,
  enabled = true,
) =>
  useQuery<WorkflowPaths>({
    queryKey: ['callWorkflowPaths', callUuid, roundUuid],
    queryFn: () =>
      proposalProtectedCallsWorkflowPathsRetrieve({
        path: { uuid: callUuid },
        query: roundUuid ? { round: roundUuid } : undefined,
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** One proposal's steps planned against actual and the mail sent about it:
 * the call team's; anyone else, the applicant team included, gets 404. */
export const useProposalWorkflowTimeline = (proposalUuid: string) =>
  useQuery<WorkflowTimeline>({
    queryKey: ['proposalWorkflowTimeline', proposalUuid],
    queryFn: () =>
      proposalProposalsWorkflowTimelineRetrieve({
        path: { uuid: proposalUuid },
      }).then((response) => response.data),
    enabled: Boolean(proposalUuid),
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });
