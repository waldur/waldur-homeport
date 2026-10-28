import Markdown from 'markdown-to-jsx';

import { translate } from '@/i18n';

import { Call } from '../types';

import { CallDetailsFields } from './CallDetailsFields';

interface CallDescriptionCardProps {
  call: Call;
}

export const CallDescriptionCard = ({ call }: CallDescriptionCardProps) => (
  <div className="card card-bordered">
    <div className="card-header">
      <div className="card-title">
        <h3>{translate('Description')}</h3>
      </div>
    </div>
    <div className="card-body">
      <Markdown
        options={{
          overrides: {
            CallDetailsFields: {
              component: () => <CallDetailsFields call={call} />,
            },
          },
        }}
      >
        {call.description || '<CallDetailsFields></CallDetailsFields>'}
      </Markdown>
    </div>
  </div>
);
