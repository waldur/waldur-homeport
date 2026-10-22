import { Ref } from 'react';

import { AdminAnnouncements } from './AdminAnnouncements';

/**
 * The admin announcements, then the bars pages add (LayoutSlot
 * `announcements`), rendered into `extraRef`.
 */
export const Announcements = ({
  extraRef,
}: {
  extraRef?: Ref<HTMLDivElement>;
}) => (
  <div>
    <AdminAnnouncements />
    <div ref={extraRef} />
  </div>
);
