import { FC, ReactNode, useState } from 'react';

import { SegmentedControl } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useTemplateWorkflowDescription } from '@/proposals/workflow-description/queries';

type View = 'steps' | 'diagram' | 'timeline' | 'scenarios';

const WorkflowDiagramPanel = lazyComponent(() =>
  import('@/proposals/workflow-description/diagram/WorkflowDiagramPanel').then(
    (module) => ({ default: module.WorkflowDiagramPanel }),
  ),
);
const TemplateScenariosPanel = lazyComponent(() =>
  import('@/proposals/workflow-description/scenarios/ChecksPanels').then(
    (module) => ({ default: module.TemplateScenariosPanel }),
  ),
);
const WorkflowTimelinePanel = lazyComponent(() =>
  import('@/proposals/workflow-description/diagram/WorkflowTimelinePanel').then(
    (module) => ({ default: module.WorkflowTimelinePanel }),
  ),
);

/** A template's workflow as its step list, a swimlane diagram or its
 * planned timeline: the diagram and the timeline once its description has
 * loaded. For staff, also its saved scenarios: definitions, which run on
 * the calls created from the template. */
export const CallTemplateWorkflowViews: FC<{
  templateUuid: string;
  name: string;
  steps: ReactNode;
  /** The template's saved scenarios, shown as a view of their own: for
   * staff, who write them. */
  scenarios?: Array<Record<string, any>>;
}> = ({ templateUuid, name, steps, scenarios }) => {
  const [view, setView] = useState<View>('steps');
  const { data: description } = useTemplateWorkflowDescription(templateUuid);
  return (
    <>
      {description ? (
        <SegmentedControl<View>
          aria-label={translate('View')}
          size="sm"
          className="mb-3"
          options={[
            { value: 'steps', label: translate('Steps') },
            { value: 'diagram', label: translate('Diagram') },
            { value: 'timeline', label: translate('Timeline') },
            ...(scenarios
              ? [
                  {
                    value: 'scenarios' as View,
                    label: scenarios.length
                      ? translate('Scenarios ({count})', {
                          count: scenarios.length,
                        })
                      : translate('Scenarios'),
                  },
                ]
              : []),
          ]}
          value={view}
          onValueChange={setView}
        />
      ) : null}
      {view === 'steps' || !description ? (
        steps
      ) : view === 'diagram' ? (
        <WorkflowDiagramPanel description={description} name={name} />
      ) : view === 'scenarios' ? (
        <TemplateScenariosPanel
          scenarios={scenarios ?? []}
          description={description}
        />
      ) : (
        <WorkflowTimelinePanel description={description} name={name} />
      )}
    </>
  );
};
