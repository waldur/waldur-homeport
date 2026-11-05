import { ThreadPrimitive } from '@assistant-ui/react';
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CodeIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { FC, useEffect, useId, useState } from 'react';

import { AlertItem, BaseButton, Code } from 'waldur-ui';

import { useScriptPanel } from '@/ai-assistant/components/ScriptPanel';
import { CodeHeader } from '@/ai-assistant/components/shared/CodeHeader';
import { SkeletonLoader } from '@/ai-assistant/components/shared/SkeletonLoader';
import { UIBlock, UIBlockProps } from '@/ai-assistant/lib/types';
import { lazyComponent } from '@/core/lazyComponent';
import { isModifiedClick, Link } from '@/core/Link';
import { useOptionalDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { notifyHpcJobSubmitted } from '@/marketplace/resources/details/hpc/queries';
import { useModal } from '@/modal/actions';

const HpcScriptDialog = lazyComponent(() =>
  import('@/marketplace/resources/details/hpc/HpcScriptDialog').then(
    (module) => ({ default: module.HpcScriptDialog }),
  ),
);

/** A preview the user can still submit or change from the message footer. */
export const isHpcJobAwaitingConfirmation = (block: UIBlock): boolean =>
  block.key === 'hpc_job' &&
  block.job_status === 'preview' &&
  !block.job_id &&
  !block.errors?.length;

const MessageList: FC<{
  variant: 'error' | 'warning';
  title: string;
  items?: string[];
}> = ({ variant, title, items }) =>
  items?.length ? (
    <AlertItem
      variant={variant}
      type="floating"
      className="mb-3"
      title={title}
      body={
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      }
    />
  ) : null;

// Jobs already announced to a jobs table, so a card read again (the thread
// reloaded or scrolled back to) does not refresh the table once more.
const announcedJobs = new Set<string>();

// Lines of the script a card shows before "Show all"; a few more are not
// worth the toggle.
const PREVIEW_LINES = 12;

const ScriptPreview: FC<{ script: string }> = ({ script }) => {
  const [open, setOpen] = useState(false);
  const lines = script.replace(/\n$/, '').split('\n');
  const long = lines.length > PREVIEW_LINES + 3;
  return (
    <div className="aui-code-block-root">
      <CodeHeader language="bash" code={script} />
      <pre className="aui-md-pre">
        <code>
          {long && !open ? lines.slice(0, PREVIEW_LINES).join('\n') : script}
        </code>
      </pre>
      {long && (
        <BaseButton
          variant="tertiary"
          size="sm"
          className="mt-2"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          label={
            open
              ? translate('Show less')
              : translate('Show all {count} lines', { count: lines.length })
          }
        />
      )}
    </div>
  );
};

export const HpcJobBlock: FC<UIBlockProps> = ({ block }) => {
  const submittedJob =
    block.status !== 'loading' && block.job_id && block.allocation_uuid
      ? `${block.allocation_uuid}/${block.job_id}`
      : null;
  useEffect(() => {
    if (!submittedJob || announcedJobs.has(submittedJob)) return;
    announcedJobs.add(submittedJob);
    notifyHpcJobSubmitted(block.allocation_uuid);
  }, [submittedJob, block.allocation_uuid]);

  const context = [
    block.allocation,
    block.account && translate('account {account}', { account: block.account }),
    block.cluster,
    block.partition &&
      translate('partition {partition}', { partition: block.partition }),
  ]
    .filter(Boolean)
    .join(' · ');
  const name = block.name || translate('Batch job');
  const script = block.status !== 'loading' ? block.script : undefined;

  // Beside the full-screen chat the script goes to the panel on the right.
  const panel = useScriptPanel();
  const panelId = useId();
  const filesKey = JSON.stringify(block.files ?? []);
  const register = panel?.register;
  const unregister = panel?.unregister;
  useEffect(() => {
    if (!register || !script) return;
    register({
      id: panelId,
      key: `${name}\n${script}`,
      title: name,
      subtitle: context,
      script,
      files: JSON.parse(filesKey),
    });
  }, [register, panelId, name, context, script, filesKey]);
  useEffect(() => () => unregister?.(panelId), [unregister, panelId]);

  const { openDialog } = useModal();
  const viewScript = () =>
    panel?.available
      ? panel.show(`${name}\n${script}`)
      : openDialog(HpcScriptDialog, {
          resolve: { name, script, files: block.files },
          size: 'xl',
        });
  // The jobs table is behind the full-screen chat: make room for it.
  const drawer = useOptionalDrawer();

  if (block.status === 'loading') {
    return (
      <div className="aui-vm-order-block">
        <SkeletonLoader />
      </div>
    );
  }

  const submitted = block.job_status === 'submitted' || Boolean(block.job_id);
  const viewScriptButton = script ? (
    <BaseButton
      variant="tertiary"
      size="sm"
      onClick={viewScript}
      iconNode={<CodeIcon weight="bold" />}
      label={translate('View script')}
    />
  ) : null;

  return (
    <div
      className="aui-vm-order-block"
      data-has-actions={isHpcJobAwaitingConfirmation(block) || undefined}
    >
      {block.content && (
        <div className="aui-vm-order-intro mb-3">{block.content}</div>
      )}

      <div className="rounded-md border border-secondary p-4 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold wrap-anywhere">{name}</div>
            {context && (
              <div className="text-tertiary text-xs wrap-anywhere">
                {context}
              </div>
            )}
          </div>
          {submitted && (
            <span className="flex items-center gap-1 text-success font-medium whitespace-nowrap">
              <CheckCircleIcon weight="bold" />
              {translate('Submitted')}
            </span>
          )}
        </div>

        {submitted ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {block.job_id && (
              <span>
                {translate('Job ID')}: <Code>{block.job_id}</Code>
              </span>
            )}
            {block.job_id && block.allocation_uuid && (
              <Link
                state="marketplace-resource-details"
                params={{
                  resource_uuid: block.allocation_uuid,
                  tab: 'hpc-jobs',
                  object: block.job_id,
                }}
                role="link"
                onClick={(e) => {
                  // A new tab leaves the chat as it is.
                  if (!isModifiedClick(e)) drawer?.setExpanded(false);
                }}
                className="flex items-center gap-1"
              >
                {translate('Follow the job')}
                <ArrowSquareOutIcon weight="bold" />
              </Link>
            )}
            {viewScriptButton}
          </div>
        ) : (
          panel?.available &&
          viewScriptButton && <div className="mt-3">{viewScriptButton}</div>
        )}
      </div>

      <MessageList
        variant="error"
        title={translate('The job does not fit the cluster limits')}
        items={block.errors}
      />
      <MessageList
        variant="warning"
        title={translate('Warnings')}
        items={block.warnings}
      />

      {/* A submitted job's script was shown with its preview; the panel and
          the dialog still have it. */}
      {script && !submitted && !panel?.available && (
        <>
          <ScriptPreview script={script} />
          <div className="mt-2">{viewScriptButton}</div>
        </>
      )}

      {isHpcJobAwaitingConfirmation(block) && (
        <div className="aui-vm-order-confirm mt-4">
          {translate('Submit this job to the cluster?')}
        </div>
      )}
    </div>
  );
};

/**
 * Submit / Modify for a previewed job, rendered in the message footer. They
 * answer the assistant the way the VM preview's Create / Modify buttons do.
 */
export const HpcJobActions: FC<UIBlockProps> = ({ block }) => {
  if (!isHpcJobAwaitingConfirmation(block)) {
    return null;
  }
  return (
    <div className="aui-vm-order-actions">
      <ThreadPrimitive.Suggestion
        prompt={translate('I want to modify the job. What can I change?')}
        send
        clearComposer={false}
        asChild
      >
        <button className="aui-vm-order-action-btn aui-vm-order-action-btn--secondary">
          <PencilSimpleIcon size={16} weight="bold" />
          {translate('Modify')}
        </button>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        prompt={translate('Submit the job')}
        send
        clearComposer={false}
        asChild
      >
        <button className="aui-vm-order-action-btn aui-vm-order-action-btn--primary">
          <PaperPlaneTiltIcon size={16} weight="bold" />
          {translate('Submit')}
        </button>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};
