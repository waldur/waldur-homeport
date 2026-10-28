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
              'Project digest sends periodic email summaries to project members, giving them an overview of each project they belong to. Digests include information such as active resources, project timelines, and team composition.',
            )}
          </p>
        </section>

        <section>
          <h4 className="mb-3">{translate('How it works')}</h4>
          <ol className="text-quaternary mb-0">
            <li className="mb-1.5">
              {translate(
                'An organization owner enables digest emails and chooses the frequency (weekly, bi-weekly, or monthly) and the delivery day.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'Optionally, specific sections can be selected to include in the digest. If none are selected, all available sections are included.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'On the scheduled day, the system collects data for each project in the organization.',
              )}
            </li>
            <li className="mb-1.5">
              {translate(
                'Each project member receives an email summarizing only the projects they belong to.',
              )}
            </li>
            <li>
              {translate(
                'Emails are rendered in the preferred language of each recipient.',
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
                    'Lists active resources in the project with their type and current state.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Project Timeline')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Shows the project end date, days remaining, and grace period status.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-primary">
                  {translate('Team')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Summarizes the number of project members grouped by role.',
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
                    'Sent every two weeks on the selected day of the week.',
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
                    'Use the "Send test email" button to send a digest to yourself for review.',
                  )}
                </li>
                <li>
                  {translate(
                    'Use the "Preview" section below the form to see the rendered digest for a specific project.',
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
