import { AdminAnnouncements } from './AdminAnnouncements';

export const Announcements = ({ extraAnnouncement }) => (
  <div className="announcements">
    <AdminAnnouncements />
    {extraAnnouncement}
  </div>
);
