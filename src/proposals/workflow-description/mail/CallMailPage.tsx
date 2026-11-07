import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { AlertItem, IBreadcrumbItem, TabNav, useBreadcrumbs } from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { AccessDeniedPage } from '@/error/AccessDeniedPage';
import { InvalidRoutePage } from '@/error/InvalidRoutePage';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { Call } from '@/proposals/types';
import { useCallBreadcrumbItems } from '@/proposals/utils';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { CALL_VALIDATION_STATE } from '@/proposals/workflow-check/WorkflowCheckPanel';
import { useUser } from '@/workspace/hooks';

import { PanelHeaderSlotProvider } from '../PanelHeaderControls';

import { MailCustomisePane } from './MailCustomisePane';
import { canEditMailOf, previewErrorText } from './MailDialog';
import { CALL_MAIL_STATE, mailTargetFromParams, mailTitle } from './mailPage';
import { MailRulePane } from './MailRulePane';
import { MailTarget, useCallForMail, useMailPreview } from './queries';

/** A pane's Save and Cancel, at the foot of its panel. */
const PanelFooter: FC<{ setSlot(element: HTMLDivElement | null): void }> = ({
  setSlot,
}) => <div ref={setSlot} className="flex flex-wrap justify-end gap-1.5 mt-3" />;

interface MailPageContextValue {
  call: Call;
  target: MailTarget;
  preview: ReturnType<typeof useMailPreview>;
}

const MailPageContext = createContext<MailPageContextValue>(null);

const RulesTab: FC = () => {
  const { call, target } = useContext(MailPageContext);
  const { data: steps } = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
    enabled: Boolean(target.step),
    refetchOnWindowFocus: false,
  });
  const step = steps?.find((candidate) => candidate.key === target.step);
  const [footer, setFooter] = useState<HTMLDivElement | null>(null);
  const [header, setHeader] = useState<HTMLDivElement | null>(null);
  const ignoreEditing = useCallback(() => undefined, []);
  return (
    <Panel
      cardBordered
      // The rules' Add sits here (PanelHeaderControls in MailRulePane).
      actions={<div ref={setHeader} className="contents" />}
      bodyClassName="pt-0"
      title={translate('Rules')}
      subtitle={translate('Who is told of which event of {step}.', {
        step: target.stepName ?? target.step,
      })}
      subtitleClassName="font-normal"
    >
      <PanelHeaderSlotProvider value={{ slot: header }}>
        {step ? (
          <MailRulePane
            callUuid={call.uuid}
            step={step}
            target={target}
            footerSlot={footer}
            onEditingChange={ignoreEditing}
          />
        ) : (
          <LoadingSpinner />
        )}
      </PanelHeaderSlotProvider>
      <PanelFooter setSlot={setFooter} />
    </Panel>
  );
};

const WordingTab: FC = () => {
  const { call, target, preview } = useContext(MailPageContext);
  const [footer, setFooter] = useState<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<HTMLSpanElement | null>(null);
  return (
    <Panel
      cardBordered
      title={translate('Wording')}
      // Where the wording comes from, as the block's description; Save and
      // its companions in the block's header.
      subtitle={<span ref={setStatus} />}
      subtitleClassName="font-normal"
      actions={
        <div ref={setFooter} className="flex flex-wrap items-center gap-1.5" />
      }
    >
      {preview.data ? (
        <MailCustomisePane
          callUuid={call.uuid}
          mailKey={preview.data.key}
          target={target}
          footerSlot={footer}
          statusSlot={status}
        />
      ) : preview.isLoading ? (
        <LoadingSpinner />
      ) : (
        <AlertItem variant="warning" title={previewErrorText(preview.error)} />
      )}
    </Panel>
  );
};

/**
 * The call's crumbs, then its notifications and this mail: as on the call's
 * other drill-down pages, the crumbs lead back, with no back button.
 */
const useMailBreadcrumbItems = (call: Call) => {
  const callItems = useCallBreadcrumbItems(call);
  return useMemo<IBreadcrumbItem[]>(
    () => [
      // Organisations and the organisation; no 'Calls for proposals' crumb,
      // as on the proposal pages, so the trail fits without folding.
      ...callItems.slice(0, 2),
      {
        key: 'call',
        text: call.name,
        to: CALL_VALIDATION_STATE,
        params: { call_uuid: call.uuid },
        maxLength: 28,
        ellipsis: 'xl',
      },
      {
        key: 'notifications',
        text: translate('Notifications'),
        to: CALL_VALIDATION_STATE,
        params: { call_uuid: call.uuid, tab: 'notifications' },
      },
      // Short: the page's title names the mail in full.
      { key: 'mail', text: translate('Mail'), active: true },
    ],
    [callItems, call],
  );
};

const Body: FC<{ call: Call; target: MailTarget }> = ({ call, target }) => {
  const preview = useMailPreview(call.uuid, target);
  const title = mailTitle(target, preview.data?.label);
  useBreadcrumbs(useMailBreadcrumbItems(call));
  useTitle(title);
  // Rules and wording are changed apart, each with its own Save: a tab each.
  const { params } = useCurrentStateAndParams();
  const tabs = [
    ...(target.step
      ? [{ key: 'rules', title: translate('Rules'), Component: RulesTab }]
      : []),
    { key: 'wording', title: translate('Wording'), Component: WordingTab },
  ];
  const active = tabs.find((tab) => tab.key === params.tab) ?? tabs[0];
  const context = useMemo(
    () => ({ call, target, preview }),
    [call, target, preview],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="mb-4 text-2xl">{title}</h1>
        <TabNav
          items={tabs.map((tab) => ({
            key: tab.key,
            title: tab.title,
            link: (
              <Link
                state={CALL_MAIL_STATE}
                params={{ ...params, tab: tab.key }}
              />
            ),
            active: tab.key === active.key,
          }))}
        />
      </div>
      <MailPageContext.Provider value={context}>
        <active.Component />
      </MailPageContext.Provider>
    </div>
  );
};

/** One mail of a call: the rules that send it and the call's wording of it. */
export const CallMailPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const user = useUser();
  const target = useMemo(() => mailTargetFromParams(params), [params]);
  // The call the mail dialog reads too, so it is fetched once.
  const { data: call, isLoading, error } = useCallForMail(params.call_uuid);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    canEditMailOf(user, call) ? (
      <Body call={call as Call} target={target} />
    ) : (
      <AccessDeniedPage />
    )
  ) : (
    <InvalidRoutePage />
  );
};
