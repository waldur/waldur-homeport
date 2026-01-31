import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const ProjectDigestSummaryDialog: FC = () => {
  return (
    <ModalDialog
      title={translate('How project digest works')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-8">
        <section>
          <h4 className="mb-4">{translate('Overview')}</h4>
          <p className="text-muted mb-0">
            {translate(
              'Project digest sends periodic email summaries to project members, giving them an overview of each project they belong to. Digests include information such as active resources, project timelines, and team composition.',
            )}
          </p>
        </section>

        <section>
          <h4 className="mb-4">{translate('How it works')}</h4>
          <ol className="text-muted mb-0">
            <li className="mb-2">
              {translate(
                'An organization owner enables digest emails and chooses the frequency (weekly, bi-weekly, or monthly) and the delivery day.',
              )}
            </li>
            <li className="mb-2">
              {translate(
                'Optionally, specific sections can be selected to include in the digest. If none are selected, all available sections are included.',
              )}
            </li>
            <li className="mb-2">
              {translate(
                'On the scheduled day, the system collects data for each project in the organization.',
              )}
            </li>
            <li className="mb-2">
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
          <h4 className="mb-4">{translate('Available sections')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The digest can include the following sections, depending on which plugins are installed:',
            )}
          </p>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>{translate('Section')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="fw-bold text-gray-800">
                    {translate('Resource Usage')}
                  </td>
                  <td>
                    {translate(
                      'Lists active resources in the project with their type and current state.',
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold text-gray-800">
                    {translate('Project Timeline')}
                  </td>
                  <td>
                    {translate(
                      'Shows the project end date, days remaining, and grace period status.',
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold text-gray-800">{translate('Team')}</td>
                  <td>
                    {translate(
                      'Summarizes the number of project members grouped by role.',
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="mb-4">{translate('Frequency options')}</h4>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>{translate('Frequency')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="fw-bold text-gray-800">
                    {translate('Weekly')}
                  </td>
                  <td>
                    {translate(
                      'Sent once a week on the selected day of the week.',
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold text-gray-800">
                    {translate('Bi-weekly')}
                  </td>
                  <td>
                    {translate(
                      'Sent every two weeks on the selected day of the week.',
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold text-gray-800">
                    {translate('Monthly')}
                  </td>
                  <td>
                    {translate(
                      'Sent once a month on the selected day of the month (1-28).',
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="alert alert-info mb-0">
            <strong>{translate('Good to know:')}</strong>
            <ul className="mb-0 mt-2">
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
          </div>
        </section>
      </div>
    </ModalDialog>
  );
};
