import { FC } from 'react';

import { MermaidChart } from '@/core/MermaidChart';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const SETUP_FLOW_DIAGRAM = `
flowchart TB
    subgraph setup["Appservice Setup"]
        A["Staff clicks 'Setup appservice'"] --> B["Optionally enter Waldur URL and bot localpart"]
        B --> C["Waldur generates AS & HS tokens"]
        C --> D["Registration YAML is displayed"]
    end

    subgraph homeserver["Homeserver Configuration"]
        D --> E["Admin copies YAML to homeserver config"]
        E --> F["Restart homeserver"]
        F --> G{Homeserver connects to webhook?}
        G -->|Yes| H["Appservice is active"]
        G -->|No| I["Check URL reachability and tokens"]
        I --> E
    end

    style G fill:#fff3e0,color:#000
    style H fill:#e8f5e9,color:#000
`;

const ROOM_LIFECYCLE_DIAGRAM = `
flowchart TB
    subgraph creation["Room Creation"]
        A["Owner clicks 'Create chat room'"] --> B["Waldur calls homeserver API"]
        B --> C["Room created with alias #waldur-{uuid}"]
        C --> D["Auto-sync: invite project members"]
    end

    subgraph membership["Member Management"]
        D --> E["Each project member gets invited"]
        E --> F["Power levels set based on role"]
        F --> G["Owner/Admin = power 50+, Member = 0"]
    end

    subgraph lifecycle["Room Lifecycle"]
        G --> H["Room is ACTIVE"]
        H --> I["Members join via Matrix client"]
        H --> J["Owner can re-sync members anytime"]
        H --> K["Owner can export chat history"]
        H --> L["Owner clicks 'Disable chat'"]
        L --> M["DISABLING: members kicked, history exported"]
        M --> N["Room is ARCHIVED"]
        N --> O["Owner can re-enable or delete room"]
        O -->|Re-enable| H
        H --> P["Room archived on project deletion"]
    end

    style H fill:#e8f5e9,color:#000
    style N fill:#e0e0e0,color:#000
    style M fill:#fff3e0,color:#000
    style P fill:#fff3e0,color:#000
`;

const WEBHOOK_FLOW_DIAGRAM = `
flowchart LR
    subgraph homeserver["Matrix Homeserver"]
        A["Room event occurs"]
        A --> B["PUT /api/matrix-appservice/transactions/{txnId}/"]
    end

    subgraph waldur["Waldur Appservice"]
        B --> C{Valid HS token?}
        C -->|No| D["401 Unauthorized"]
        C -->|Yes| E{Already processed?}
        E -->|Yes| F["200 OK (idempotent)"]
        E -->|No| G["Queue event processing"]
    end

    subgraph processing["Event Processing"]
        G --> H{Bot command?}
        H -->|Yes| I["Execute command"]
        I --> J["Send reply to room"]
        H -->|No| K["Ignore event"]
    end

    style C fill:#fff3e0,color:#000
    style E fill:#fff3e0,color:#000
    style J fill:#e8f5e9,color:#000
`;

const EXPORT_FLOW_DIAGRAM = `
flowchart TB
    subgraph trigger["Export Triggers"]
        A["Manual: owner clicks 'Export history'"]
        B["Periodic: daily at 2 AM"]
        C["On disable: before archiving room"]
        D2["On project deletion: before archiving"]
    end

    subgraph process["Export Process"]
        A & B & C & D2 --> D["Fetch room messages (paginated)"]
        D --> E{Export media enabled?}
        E -->|Yes| F["Download media files"]
        F --> G["Package into ZIP archive"]
        E -->|No| H["Skip media"]
        G --> I["Save JSON export + media ZIP"]
        H --> I
    end

    subgraph result["Result"]
        I --> J["Export file: messages, metadata"]
        J --> K["Available for download"]
    end

    style E fill:#fff3e0,color:#000
    style K fill:#e8f5e9,color:#000
`;

const BOT_COMMANDS = [
  {
    command: '!help',
    description: translate('Show available bot commands'),
  },
  {
    command: '!status',
    description: translate(
      'Show resource status summary for the linked project',
    ),
  },
  {
    command: '!orders',
    description: translate('Show the last 5 orders for the project'),
  },
  {
    command: '!members',
    description: translate('List room members with their project roles'),
  },
];

const KEY_CONCEPTS = [
  {
    term: translate('Appservice'),
    description: translate(
      'A Matrix protocol mechanism that allows Waldur to register as a service on the homeserver. The homeserver pushes events to Waldur via a webhook, and Waldur can create rooms, invite users, and send messages on behalf of a bot user.',
    ),
  },
  {
    term: translate('AS token / HS token'),
    description: translate(
      'Two shared secrets generated during setup. The AS token authenticates Waldur when calling the homeserver API. The HS token authenticates the homeserver when sending events to Waldur via webhook.',
    ),
  },
  {
    term: translate('Registration YAML'),
    description: translate(
      'A configuration file that must be added to the Matrix homeserver to register Waldur as an appservice. Contains tokens, bot user ID, webhook URL, and namespace declarations.',
    ),
  },
  {
    term: translate('Room alias'),
    description: translate(
      'A human-readable room address (e.g., #waldur-a1b2c3d4:matrix.example.com). Waldur generates aliases based on the project UUID.',
    ),
  },
  {
    term: translate('Power levels'),
    description: translate(
      'Matrix permission system. Project owners and admins get elevated power levels (50+), allowing them to manage the room. Regular members get the default level (0).',
    ),
  },
  {
    term: translate('History export'),
    description: translate(
      'A snapshot of all messages in a room, saved as a JSON file. Optionally includes media files in a ZIP archive. Can be triggered manually, on a schedule, or automatically before project deletion.',
    ),
  },
];

export const MatrixHowItWorksDialog: FC = () => {
  return (
    <ModalDialog
      title={translate('How Matrix chat integration works')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-8">
        {/* Overview */}
        <section>
          <div className="alert alert-info">
            <strong>{translate('What is Matrix chat integration?')}</strong>
            <p className="mb-0 mt-2">
              {translate(
                'Matrix is an open protocol for decentralized communication. This integration registers Waldur as a Matrix appservice, enabling automatic creation of project chat rooms, member synchronization based on project roles, bot commands for operational queries, and chat history exports for compliance.',
              )}
            </p>
          </div>
        </section>

        {/* Setup Flow */}
        <section>
          <h4 className="mb-4">{translate('Appservice setup')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The setup process generates authentication tokens and a registration YAML that must be added to your Matrix homeserver configuration.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={SETUP_FLOW_DIAGRAM} className="text-center" />
          </div>
          <div className="alert alert-secondary mt-4">
            <strong>{translate('Setup steps:')}</strong>
            <ol className="mb-0 mt-2">
              <li>
                {translate(
                  'Click "Setup appservice" and optionally provide the Waldur URL reachable by the homeserver',
                )}
              </li>
              <li>
                {translate(
                  'Copy the generated registration YAML to your homeserver configuration directory',
                )}
              </li>
              <li>
                {translate(
                  'Register the YAML file in your homeserver settings (e.g., app_service_config_files in Synapse, or the equivalent for your homeserver)',
                )}
              </li>
              <li>
                {translate(
                  'Restart the homeserver — it will begin sending events to the Waldur webhook',
                )}
              </li>
            </ol>
          </div>
        </section>

        {/* Room Lifecycle */}
        <section>
          <h4 className="mb-4">{translate('Room lifecycle')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Each project can have one chat room. Rooms are created by project owners and automatically populated with project members. Owners can disable a room (kicking all members and exporting history) and later re-enable it or delete it entirely.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={ROOM_LIFECYCLE_DIAGRAM}
              className="text-center"
            />
          </div>
        </section>

        {/* Webhook Flow */}
        <section>
          <h4 className="mb-4">{translate('Webhook event processing')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The homeserver pushes room events to Waldur via the appservice webhook. Waldur processes bot commands and ignores other events.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={WEBHOOK_FLOW_DIAGRAM} className="text-center" />
          </div>
        </section>

        {/* Bot Commands */}
        <section>
          <h4 className="mb-4">{translate('Bot commands')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The Waldur bot responds to commands posted in project chat rooms. Type a command in the room and the bot will reply with the relevant information.',
            )}
          </p>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th style={{ width: '20%' }}>{translate('Command')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {BOT_COMMANDS.map((cmd) => (
                  <tr key={cmd.command}>
                    <td>
                      <code className="fw-bold">{cmd.command}</code>
                    </td>
                    <td>{cmd.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Export Flow */}
        <section>
          <h4 className="mb-4">{translate('History export')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Chat history can be exported as JSON files with optional media attachments. Exports can be triggered manually, run on a daily schedule, or happen automatically when a room is disabled or a project is deleted.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={EXPORT_FLOW_DIAGRAM} className="text-center" />
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h4 className="mb-4">{translate('Key concepts')}</h4>
          {KEY_CONCEPTS.map((concept) => (
            <div key={concept.term} className="mb-4">
              <h6 className="fw-bold">{concept.term}</h6>
              <p className="text-muted mb-0">{concept.description}</p>
            </div>
          ))}
        </section>
      </div>
    </ModalDialog>
  );
};
