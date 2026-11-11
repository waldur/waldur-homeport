import { FunctionComponent } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const ApplicationDetailsTable = ({ application }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{translate('Key')}</TableHead>
        <TableHead>{translate('Value')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>{translate('Version')}</TableCell>
        <TableCell>{application.version}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{translate('Template')}</TableCell>
        <TableCell>{application.template_name}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{translate('Catalog')}</TableCell>
        <TableCell>{application.catalog_name}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{translate('Link')}</TableCell>
        <TableCell>
          <ExternalLink
            url={application.external_url}
            label={translate('Open')}
          />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const ApplicationAnswersTable = ({ application }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{translate('Question')}</TableHead>
        <TableHead>{translate('Answer')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Object.keys(application.answers).map((key) => {
        const value = application.answers[key];
        return (
          <TableRow key={key}>
            <TableCell className="ellipsis">{key}</TableCell>
            <TableCell>
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export const ApplicationDetailsDialog: FunctionComponent<{
  resolve: { application };
}> = ({ resolve: { application } }) => (
  <ModalDialog
    title={translate('Application details')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <Accordion
      id="application-details"
      type="single"
      collapsible
      defaultValue="summary"
      className="rounded-md border border-solid border-secondary"
    >
      <AccordionItem value="summary">
        <AccordionTrigger>{translate('Summary')}</AccordionTrigger>
        <AccordionContent>
          <ApplicationDetailsTable application={application} />
        </AccordionContent>
      </AccordionItem>
      {application.answers && (
        <AccordionItem value="answers">
          <AccordionTrigger>{translate('Answers')}</AccordionTrigger>
          <AccordionContent>
            <ApplicationAnswersTable application={application} />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  </ModalDialog>
);
