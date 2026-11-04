import { ThreadPrimitive } from '@assistant-ui/react';
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { AlertItem, Code } from 'waldur-ui';

import { CodeHeader } from '@/ai-assistant/components/shared/CodeHeader';
import { SkeletonLoader } from '@/ai-assistant/components/shared/SkeletonLoader';
import { UIBlock, UIBlockProps } from '@/ai-assistant/lib/types';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';

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

export const HpcJobBlock: FC<UIBlockProps> = ({ block }) => {
  if (block.status === 'loading') {
    return (
      <div className="aui-vm-order-block">
        <SkeletonLoader />
      </div>
    );
  }

  const submitted = block.job_status === 'submitted' || Boolean(block.job_id);
  const context = [
    block.allocation,
    block.account && translate('account {account}', { account: block.account }),
    block.cluster,
    block.partition &&
      translate('partition {partition}', { partition: block.partition }),
  ].filter(Boolean);

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
            <div className="font-semibold wrap-anywhere">
              {block.name || translate('Batch job')}
            </div>
            {context.length > 0 && (
              <div className="text-tertiary text-xs wrap-anywhere">
                {context.join(' · ')}
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

        {submitted && block.job_id && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span>
              {translate('Job ID')}: <Code>{block.job_id}</Code>
            </span>
            {block.allocation_uuid && (
              <Link
                state="marketplace-resource-details"
                params={{
                  resource_uuid: block.allocation_uuid,
                  tab: 'hpc-jobs',
                }}
                className="flex items-center gap-1"
              >
                {translate('Open jobs')}
                <ArrowSquareOutIcon weight="bold" />
              </Link>
            )}
          </div>
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

      {block.script && (
        <div className="aui-code-block-root">
          <CodeHeader language="bash" code={block.script} />
          <pre className="aui-md-pre">
            <code>{block.script}</code>
          </pre>
        </div>
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
