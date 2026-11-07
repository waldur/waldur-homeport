import { FC, useMemo, useState } from 'react';

import { AccordionCard, Tabs, TabsList, TabsTrigger } from 'waldur-ui';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';

import { useSectionOpenState } from '../proposal/sectionOpen';

import {
  ActivityCategory,
  getActivityCategories,
  getCategoryEventTypes,
} from './categories';

export const PROPOSAL_ACTIVITY_SECTION_ID = 'step-activity';

/**
 * The proposal's history, newest first (the events API's own order). Everyone who reads the proposal sees
 * it; the backend decides which events each of them reads.
 */
export const ProposalActivitySection: FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const openState = useSectionOpenState();
  // Fetched only once unfolded: the card keeps its body while folded.
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = openState
    ? openState.isOpen(PROPOSAL_ACTIVITY_SECTION_ID)
    : ownOpen;
  const [category, setCategory] = useState<ActivityCategory>('all');
  const filter = useMemo(
    () => ({
      scope: proposal.url,
      event_type: getCategoryEventTypes(category),
    }),
    [proposal.url, category],
  );

  return (
    <AccordionCard
      id={PROPOSAL_ACTIVITY_SECTION_ID}
      title={translate('Activity')}
      subtitle={
        usesCallVocabulary()
          ? translate(
              'What happened on this proposal, and when. You see the events your role on it lets you read.',
            )
          : translate(
              'What happened on this access request, and when. You see the events your role on it lets you read.',
            )
      }
      isOpen={isOpen}
      onToggle={(open) =>
        openState
          ? openState.setOpen(PROPOSAL_ACTIVITY_SECTION_ID, open)
          : setOwnOpen(open)
      }
    >
      {isOpen ? (
        <>
          <Tabs
            value={category}
            onValueChange={(key) => setCategory(key as ActivityCategory)}
          >
            <TabsList>
              {getActivityCategories().map((item) => (
                <TabsTrigger key={item.key} value={item.key} hint={item.help}>
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* One fixed height for every category, scrolling inside, so
              switching tabs doesn't resize the page under the reader. */}
          <div className="h-[500px] overflow-auto">
            <BaseEventsList
              table={`proposal-activity-${proposal.uuid}-${category}`}
              filter={filter}
              cardBordered={false}
              hasActionBar={false}
              fullWidth
              minHeight="auto"
              hideTitle
              // Nothing filtered away: the viewer's role reads none yet.
              emptyMessage={translate(
                'Nothing has happened on this proposal that your role lets you read.',
              )}
              placeholderHasRetry={false}
            />
          </div>
        </>
      ) : null}
    </AccordionCard>
  );
};
