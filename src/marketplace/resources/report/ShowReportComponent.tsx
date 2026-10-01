import { FunctionComponent } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { Report } from '@/marketplace/resources/types';

interface ShowReportComponentProps {
  report: Report;
}

export const ShowReportComponent: FunctionComponent<
  ShowReportComponentProps
> = (props) =>
  Array.isArray(props.report) ? (
    <Accordion
      type="single"
      collapsible
      defaultValue="0"
      className="rounded-md border-[1px] border-solid border-[var(--surface-card-border)]"
    >
      {props.report.map((section, index) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{section.header}</AccordionTrigger>
          <AccordionContent>
            <pre>{section.body}</pre>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ) : (
    <>{translate('Report is invalid.')}</>
  );
