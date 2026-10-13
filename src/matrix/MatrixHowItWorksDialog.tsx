import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { MermaidChart } from '@/core/MermaidChart';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { REGISTER_APPSERVICE_COMMAND } from './utils';

const SETUP_FLOW_DIAGRAM = `
flowchart TB
    subgraph setup["Appservice Setup"]
        A["Staff clicks 'Setup appservice'"] --> B["Optionally enter Waldur URL and bot localpart"]
        B --> C["Waldur generates AS & HS tokens"]
        C --> D["Registration YAML is displayed"]
    end

    subgraph homeserver["Homeserver Registration"]
        D --> E{Homeserver?}
        E -->|Tuwunel| F["register_matrix_appservice, or !admin appservices register in the admin room"]
        E -->|Synapse| G["Add YAML to app_service_config_files and restart"]
        F & G --> H{Homeserver connects to webhook?}
        H -->|Yes| I["Appservice is active"]
        H -->|No| J["Check URL reachability and tokens"]
        J --> E
    end

    style E fill:#fff3e0,color:#000
    style H fill:#fff3e0,color:#000
    style I fill:#e8f5e9,color:#000
`;

const ROOM_LIFECYCLE_DIAGRAM = `
flowchart TB
    subgraph creation["Room Creation"]
        A["Owner, staff or support clicks 'Create chat room'"] --> B["Waldur calls homeserver API"]
        B --> C["Room created with alias #waldur-{uuid}"]
        C --> D["Auto-sync: invite project members"]
    end

    subgraph membership["Member Management"]
        D --> E["Each project member gets invited"]
        E --> F["Power levels set based on role"]
        F --> G["Owner/Admin = power 50, Member = 0"]
    end

    subgraph lifecycle["Room Lifecycle"]
        G --> H["Room is ACTIVE"]
        H --> I["Members join via Matrix client"]
        H --> J["Owner, staff or support can re-sync members anytime"]
        H --> K["Owner, staff or support can export chat history"]
        H --> L["Staff clicks 'Disable chat'"]
        L --> M["DISABLING: members kicked, history exported"]
        M --> N["Room is ARCHIVED"]
        N --> O["Staff can re-enable or delete room"]
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
        A --> B["PUT /_matrix/app/v1/transactions/{txnId}"]
    end

    subgraph waldur["Waldur Appservice webhook"]
        B --> C{Valid HS token?}
        C -->|No| D["403 Forbidden"]
        C -->|Yes| E{Already received?}
        E -->|Yes| F["200 OK (idempotent)"]
        E -->|No| G["Record transaction ID, 200 OK"]
    end

    subgraph matrixbot["Matrix bot (waldur matrix_bot)"]
        A -->|Sync| H["Decrypt room event"]
        H --> I{Bot command?}
        I -->|Yes| J["Send reply to room"]
        I -->|No| K["Ignore event"]
    end

    style C fill:#fff3e0,color:#000
    style E fill:#fff3e0,color:#000
    style J fill:#e8f5e9,color:#000
`;

const EXPORT_FLOW_DIAGRAM = `
flowchart TB
    subgraph trigger["Export Triggers"]
        A["Manual: owner, staff or support clicks 'Export history'"]
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
      'A Matrix protocol mechanism that allows Waldur to register as a service on the homeserver. The homeserver pushes events to Waldur via a webhook, and Waldur can create rooms and invite users on behalf of a bot user. Messages are sent by the Matrix bot.',
    ),
  },
  {
    term: translate('Matrix bot'),
    description: translate(
      'A separate, long-running process (waldur matrix_bot) that signs in as the bot user and is the encrypted member of every Waldur room. It answers commands, posts every message Waldur sends to a room, and exports history with the room keys it holds. Run exactly one: a second process refuses to start.',
    ),
  },
  {
    term: translate('AS token / HS token'),
    description: translate(
      'Two shared secrets, generated by Setup or supplied by the deployment. The AS token authenticates Waldur when calling the homeserver API. The HS token authenticates the homeserver when sending events to Waldur via webhook.',
    ),
  },
  {
    term: translate('Registration YAML'),
    description: translate(
      'The registration that makes Waldur an appservice on the homeserver: tokens, bot user ID, webhook URL, and namespace declarations. Synapse reads it from a file; Tuwunel takes it through the admin room.',
    ),
  },
  {
    term: translate('Room alias'),
    description: translate(
      'A human-readable room address (e.g., #waldur-0f8e3c2a9b7d4e6f8a1c5b3d7e9f2a4c:matrix.example.com). Waldur generates aliases based on the project UUID.',
    ),
  },
  {
    term: translate('Power levels'),
    description: translate(
      'Matrix permission system. Project admins and organization owners (any role with the "Create matrix room" permission) get level 50, which Element shows as Moderator; staff and support get it when they join a room. Everyone else gets the default level (0). Inviting, removing members and changing room settings need level 100, which only the bot holds.',
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
          <AlertItem
            type="floating"
            variant="info"
            title={translate('What is Matrix chat integration?')}
            body={translate(
              'Matrix is an open protocol for decentralized communication. This integration registers Waldur as a Matrix appservice, enabling automatic creation of project chat rooms, member synchronization based on project roles, bot commands for operational queries, and chat history exports for compliance.',
            )}
          />
        </section>

        {/* Setup Flow */}
        <section>
          <h4 className="mb-4">{translate('Appservice setup')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Helm and Docker Compose deployments supply the tokens and, by default, register the appservice on every deploy, so they show no Setup button. On other installations, Setup generates the tokens and a registration YAML, which you then register on the homeserver.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={SETUP_FLOW_DIAGRAM} className="text-center" />
          </div>
          <AlertItem
            type="floating"
            variant="info"
            className="mt-4"
            title={translate('Setup steps:')}
            body={
              <ol className="mb-0">
                <li>
                  {translate(
                    'Click "Setup appservice" and optionally provide the Waldur URL reachable by the homeserver',
                  )}
                </li>
                <li>
                  {translate(
                    'On Tuwunel, run {command} with MATRIX_ADMIN_TOKEN set, or with MATRIX_BOOTSTRAP_PASSWORD set and the homeserver\'s registration_shared_secret equal to the registration secret (see "Registering on Tuwunel from the command line" in the admin guide); or send {adminCommand} with the YAML in the admin room',
                    {
                      command: <code>{REGISTER_APPSERVICE_COMMAND}</code>,
                      adminCommand: <code>!admin appservices register</code>,
                    },
                    formatJsxTemplate,
                  )}
                </li>
                <li>
                  {translate(
                    'On Synapse, add the YAML file to app_service_config_files and restart the homeserver',
                  )}
                </li>
              </ol>
            }
          />
        </section>

        {/* Room Lifecycle */}
        <section>
          <h4 className="mb-4">{translate('Room lifecycle')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Each project can have one chat room. Rooms are created by organization owners (or any role with the "Create matrix room" permission), staff and support, and automatically populated with project members. Only staff can disable a room (kicking all members and exporting history) and later re-enable it or delete it entirely.',
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
          <h4 className="mb-4">{translate('Webhook and Matrix bot')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The homeserver pushes room events to Waldur via the appservice webhook, which only acknowledges them. The Matrix bot, a separate process ({command}) and the encrypted member of every room, reads the rooms through its own sync and answers commands. If commands go unanswered, check that this process is running.',
              { command: <code>waldur matrix_bot</code> },
              formatJsxTemplate,
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
