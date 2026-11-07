import { FC } from 'react';
import { CallTemplate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CallTemplateStepsPreview } from '@/proposals/templates/CallTemplateStepsPreview';
import { CallTemplateWorkflowViews } from '@/proposals/templates/CallTemplateWorkflowViews';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const CallTemplateExpandableRow: FC<{ row: CallTemplate }> = ({
  row,
}) => (
  <ExpandableContainer>
    {row.description ? (
      <p className="text-quaternary mb-3">{row.description}</p>
    ) : null}
    {row.steps.length ? (
      <CallTemplateWorkflowViews
        templateUuid={row.uuid}
        name={row.name}
        scenarios={row.scenarios ?? []}
        steps={
          <CallTemplateStepsPreview steps={row.steps} templateUuid={row.uuid} />
        }
      />
    ) : (
      <p className="text-quaternary mb-0">
        {translate('The template defines no workflow steps.')}
      </p>
    )}
  </ExpandableContainer>
);
