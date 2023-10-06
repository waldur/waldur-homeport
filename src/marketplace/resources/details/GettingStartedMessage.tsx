import Markdown from 'markdown-to-jsx';

import { CodeBlock } from '@waldur/core/CodeBlock';
import { formatTemplate } from '@waldur/i18n/translate';

export const GettingStartedMessage = ({ resource, offering }) => {
  const context = {
    backend_id: resource.effective_id || resource.backend_id,
    resource_name: resource.name,
    resource_username: resource.username || 'username',
  };
  return (
    <Markdown
      options={{
        overrides: {
          CodeBlock: { component: CodeBlock },
        },
      }}
    >
      {formatTemplate(offering.getting_started, context)}
    </Markdown>
  );
};
