import { FC } from 'react';

import {
  AlertItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

export const ProjectDigestSummaryDialog: FC = () => {
  return (
    <ModalDialog
      title={translate('How project digest works')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="flex flex-col gap-6">
        <section>
          <h4 className="mb-3">{translate('Overview')}</h4>
          <p className="text-quaternary mb-0">
            {translate(
              'Project digest sends periodic email summaries to project members, giving them an overview of each project they belong to. Digests include information such as active resources, project end dates, and recent team changes.',
            )}
          </p>
        </section>

        <section>
          <h4 className="mb-3">{translate('How it works')}</h4>
          <ol className="text-quaternary mb-0">
            <li className="mb-1.5">
              {translate(
                'An organization owner enables digest emails and chooses the frequency (weekly, bi-weekly, or monthly) and the delivery day. Digests are sent only if project digest is also enabled for the whole site.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'Optionally, specific sections can be selected to include in the digest. If none are selected, all available sections are included.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'A daily check runs at 08:00 server time. On the scheduled day, the system collects data for each project in the organization. Archived and blocked organizations are skipped.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'Each project member with an email address and email notifications turned on receives one email summarizing only the projects they belong to.',
              )}
            </li>
            <li>
              {translate(
                'Emails are rendered in the preferred language of each recipient, or in the default site language if none is set.',
              )}
            </li>
          </ol>
        </section>

        <section>
          <h4 className="mb-3">{translate('Available sections')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'The digest can include the following sections, depending on which plugins are installed:',
            )}
          </p>
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Section')}</TableHead>
                <TableHead>{translate('Description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Resource Usage')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Lists active resources in the project with their offering and current state.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Project Timeline')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Shows the project end date and the days remaining, highlighted when 30 days or fewer remain. Shown only for projects with an end date.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Team changes')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Counts members who joined or left the project during the digest period (the last 7, 14, or 30 days, matching the frequency), grouped by role. Shown only when the team changed.',
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <section>
          <h4 className="mb-3">{translate('Frequency options')}</h4>
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Frequency')}</TableHead>
                <TableHead>{translate('Description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Weekly')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Sent once a week on the selected day of the week.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Bi-weekly')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Sent on the selected day of the week, at most once every two weeks.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Monthly')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Sent once a month on the selected day of the month (1-28).',
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <section>
          <AlertItem
            type="floating"
            variant="info"
            title={translate('Good to know:')}
            body={
              <ul className="mb-0 mt-1.5">
                <li>
                  {translate(
                    'Use the "Send test email" button to send a digest of all projects in the organization to yourself for review. It is available once digest emails are enabled.',
                  )}
                </li>
                <li>
                  {translate(
                    'Use the "Preview" button to see the rendered digest for a specific project. The preview covers the last 30 days and uses the default site language.',
                  )}
                </li>
                <li>
                  {translate(
                    'Projects with no reportable data are skipped — members will not receive empty emails.',
                  )}
                </li>
              </ul>
            }
          />
        </section>
      </div>
    </ModalDialog>
  );
};
