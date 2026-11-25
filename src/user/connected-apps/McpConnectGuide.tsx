import { CaretRightIcon } from '@phosphor-icons/react';
import { FunctionComponent, ReactNode, useState } from 'react';

import {
  AccordionCard,
  AlertItem,
  cn,
  linkButtonVariants,
  Tabs,
} from 'waldur-ui';

import { CodeBlock } from '@/core/CodeBlock';
import { CodeLine } from '@/core/CodeLine';
import { ENV } from '@/core/config';
import { ExternalLink } from '@/core/ExternalLink';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { canUsePersonalAccessTokens } from '@/user/personal-access-tokens/canUsePersonalAccessTokens';
import { useUser } from '@/workspace/hooks';

const DOCS_URL =
  'https://docs.waldur.com/latest/user-guide/end-users/mcp-clients/';

const TOKEN_HEADER = 'Authorization: Bearer <token>';

const LINK_CLASS = cn(linkButtonVariants(), 'inline-flex items-center gap-1');

const Steps: FunctionComponent<{
  steps: { text: string; content?: ReactNode }[];
}> = ({ steps }) => (
  <ol className="m-0 flex list-decimal flex-col gap-4 ps-5 text-sm text-primary">
    {steps.map((step) => (
      <li key={step.text} className="ps-1">
        <p className="m-0 mb-2">{step.text}</p>
        {step.content}
      </li>
    ))}
  </ol>
);

interface McpConnectGuideProps {
  /** Undefined while the list is still loading. */
  hasApps?: boolean;
}

export const McpConnectGuide: FunctionComponent<McpConnectGuideProps> = ({
  hasApps,
}) => {
  const user = useUser();
  // Follows the list until the user toggles it.
  const [toggled, setToggled] = useState<boolean>();
  const expanded = toggled ?? hasApps === false;

  // The backend splits the setting on whitespace; the first URL is the main one.
  const url =
    ENV.plugins.WALDUR_CORE.MCP_RESOURCE_URLS?.split(/\s+/).find(Boolean);
  const canUseTokens = canUsePersonalAccessTokens(user);
  const isStaffOrSupport = Boolean(user?.is_staff || user?.is_support);

  return (
    <AccordionCard
      title={translate('Connect an AI client')}
      subtitle={translate(
        'How to connect an AI assistant, such as Claude Code, to your account.',
      )}
      className="mb-4 [&_[data-slot=accordion-card-header]_small]:mt-1"
      titleClassName="text-lg"
      isOpen={expanded}
      onToggle={setToggled}
    >
      <div className="flex flex-col gap-4">
        {url && (
          <div className="flex flex-col gap-2 text-sm">
            <p className="m-0 font-medium text-primary">
              {translate('Server URL')}
            </p>
            <p className="m-0 text-secondary">
              {translate(
                'Add it to your AI client. The client opens Waldur and asks you to approve it. Approved clients appear below.',
              )}
            </p>
            <CodeBlock copyable>{url}</CodeBlock>
          </div>
        )}
        {url ? (
          <Tabs
            defaultValue="claude"
            listProps={{ className: 'mb-6' }}
            items={[
              {
                value: 'claude',
                title: translate('Claude Code'),
                content: (
                  <Steps
                    steps={[
                      {
                        text: translate('Run this command in a terminal.'),
                        content: (
                          <CodeBlock prompt copyable>
                            {`claude mcp add --transport http waldur ${url}`}
                          </CodeBlock>
                        ),
                      },
                      {
                        text: translate(
                          'Start Claude Code, run /mcp and select waldur to sign in.',
                        ),
                      },
                      {
                        text: translate(
                          'Allow access on the Waldur page that opens in your browser.',
                        ),
                      },
                    ]}
                  />
                ),
              },
              {
                value: 'other',
                title: translate('Other clients'),
                content: (
                  <div className="flex flex-col gap-2 text-sm text-primary">
                    <p className="m-0">
                      {translate(
                        "Add the server URL above in your client's MCP settings, or paste this configuration if it asks for JSON.",
                      )}
                    </p>
                    <CodeBlock copyable>
                      {JSON.stringify(
                        { mcpServers: { waldur: { type: 'http', url } } },
                        null,
                        2,
                      )}
                    </CodeBlock>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <AlertItem
            variant="info"
            title={translate(
              'Sign-in from AI clients is not set up on this server yet. Ask your administrator to configure it.',
            )}
          />
        )}

        {canUseTokens && (
          <AccordionCard
            title={translate("Can't sign in through the browser?")}
            size="sm"
            className="bg-secondary"
            titleClassName="text-sm"
          >
            <div className="flex flex-col items-start gap-2 text-sm text-primary">
              <p className="m-0">
                {translate(
                  'Create a personal access token and send it in this header.',
                )}
              </p>
              <CodeLine copyable>{TOKEN_HEADER}</CodeLine>
              <Link
                state="profile-personal-access-tokens"
                className={LINK_CLASS}
              >
                {translate('Personal access tokens')}
                <CaretRightIcon size={16} weight="bold" />
              </Link>
            </div>
          </AccordionCard>
        )}

        {isStaffOrSupport && (
          <p className="m-0 text-sm text-secondary">
            {translate(
              'Staff and support: approve staff or support access when the consent page asks for it, or use a token with the STAFF.ACCESS or SUPPORT.ACCESS permission.',
            )}
          </p>
        )}
        <ExternalLink
          url={DOCS_URL}
          label={translate('Connect AI clients over MCP')}
          className={cn(LINK_CLASS, 'self-start')}
        />
      </div>
    </AccordionCard>
  );
};
