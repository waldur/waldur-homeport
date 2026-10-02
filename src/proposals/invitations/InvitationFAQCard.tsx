import { FC } from 'react';

import {
  Accordion,
  AccordionCard,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'waldur-ui';

import { translate } from '@/i18n';

export const InvitationFAQCard: FC = () => {
  const questions = [
    {
      question: translate('How many proposals will I need to review?'),
      answer: translate(
        'The number of assignments depends on the call configuration and your expertise match. You will be notified of specific assignments and can decline if your workload is too high.',
      ),
    },
    {
      question: translate('What if I have a conflict of interest?'),
      answer: translate(
        'When you receive specific proposal assignments (Step 2), you can declare any conflicts of interest. The system may also automatically detect some conflicts based on institutional affiliations or co-authorship.',
      ),
    },
    {
      question: translate('Can I change my mind after accepting?'),
      answer: translate(
        "If circumstances change, contact the call manager. They can remove you from the pool if necessary, though it's best to commit only if you expect to be available.",
      ),
    },
  ];

  return (
    <AccordionCard
      title={translate('Frequently asked questions')}
      defaultOpen
      className="mb-6"
    >
      <Accordion type="multiple" defaultValue={[questions[0].question]}>
        {questions.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger className="px-0 py-4 hover:bg-transparent data-[state=open]:bg-transparent">
              {question}
            </AccordionTrigger>
            <AccordionContent className="px-0 pt-0 pb-4 text-muted">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </AccordionCard>
  );
};
