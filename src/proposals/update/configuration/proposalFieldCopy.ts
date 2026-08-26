import { translate } from '@/i18n';
import {
  ProposalFieldName,
  ProposalFieldState,
  ProposalFieldUsage,
} from '@/proposals/types';

/** Field labels, matching the wording of the applicant's Project details step. */
export const getFieldLabel = (field: ProposalFieldName): string =>
  ({
    project_summary: translate('Summary'),
    description: translate('Description'),
    science_sub_domain: translate('Science domain'),
    supporting_documentation: translate('Supporting documentation'),
  })[field] ?? field;

export const getStateLabel = (state: ProposalFieldState): string =>
  ({
    required: translate('Required'),
    optional: translate('Optional'),
    hidden: translate('Not asked'),
  })[state] ?? state;

/**
 * What each consumer key means, in the manager's terms.
 *
 * The backend sends stable keys rather than prose so the source of truth sits
 * next to the code that consumes each field, while the wording stays here with
 * the rest of the translated UI copy.
 */
export const getUsageLabel = (usage: ProposalFieldUsage): string =>
  ({
    applicant_form: translate('Applicant form'),
    reviewer_comment: translate('Reviewer comments'),
    reviewer_matching: translate('Automatic reviewer matching'),
    manager_lists: translate('Proposal lists'),
    ai_assistant: translate('AI assistant'),
    export_import: translate('Export'),
  })[usage] ?? usage;

/**
 * Consumers whose behaviour degrades when the field is not collected, as
 * opposed to those that simply have nothing to show. These are called out as
 * warnings so a manager sees the cost before switching a field off.
 */
const CONSEQUENTIAL_USAGES: ProposalFieldUsage[] = ['reviewer_matching'];

export const isConsequential = (usage: ProposalFieldUsage): boolean =>
  CONSEQUENTIAL_USAGES.includes(usage);

export const getUsageTooltip = (
  usage: ProposalFieldUsage,
): string | undefined =>
  usage === 'reviewer_matching'
    ? translate(
        'Reviewer matching scores proposals against reviewer profiles using this text. Not collecting it makes the automatic suggestions less accurate.',
      )
    : undefined;
