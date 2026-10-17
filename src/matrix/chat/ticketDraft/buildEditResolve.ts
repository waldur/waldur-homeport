import { RequestType } from 'waldur-js-client';

import { translate } from '@/i18n';
import { IssueCreateButtonProps } from '@/issues/list/IssueCreateButton';
import { mapRequestTypeToChoice } from '@/issues/types/constants';
import { renderFieldOrDash } from '@/table/utils';

import { TicketDraft } from './parseTicketDraft';

/**
 * What the support request form opens with when the requester edits a
 * draft: its text and request type, scoped to the room's project, with the
 * resource the bot picked preselected but still changeable or clearable.
 */
export function buildEditResolve(draft: TicketDraft): IssueCreateButtonProps {
  const { project, resource } = draft;
  const issue = {
    summary: draft.title,
    description: draft.description,
    type: draft.requestType
      ? mapRequestTypeToChoice({ name: draft.requestType } as RequestType)
      : undefined,
    resource:
      resource && project
        ? {
            uuid: resource.uuid,
            name: resource.name,
            // The form labels a resource "name (offering)".
            offering_name: renderFieldOrDash(resource.offeringName),
            project_uuid: project.uuid,
          }
        : undefined,
  };
  // The helpdesk gets the priority as a line of the description, which the
  // form doesn't show: only staff and support set an issue's priority.
  const descriptionNote = draft.priority
    ? translate(
        'Suggested priority: {priority} is added to the description for the helpdesk.',
        { priority: draft.priority },
      )
    : undefined;
  if (!project) return { issue, descriptionNote };
  return {
    issue,
    descriptionNote,
    scopeType: 'project',
    scope: {
      customer_uuid: project.customerUuid,
      customer_name: project.customerName,
      uuid: project.uuid,
      name: project.name,
    },
  };
}
