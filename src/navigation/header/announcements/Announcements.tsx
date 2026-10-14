import { AdminAnnouncements } from './AdminAnnouncements';

export const Announcements = ({ extraAnnouncement }) => (
  <div>
    <AdminAnnouncements />
    {extraAnnouncement}
  </div>
);
