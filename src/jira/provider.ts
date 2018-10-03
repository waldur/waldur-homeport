import * as ProvidersRegistry from '@waldur/providers/registry';

import { JiraForm } from './JiraForm';

const serializer = data => ({
  username: data.username,
  password: data.password,
});

ProvidersRegistry.register({
  name: 'JIRA',
  type: 'JIRA',
  icon: 'icon-jira.png',
  endpoint: 'jira',
  component: JiraForm,
  serializer,
});
