import { FC } from 'react';

import { translate } from '@/i18n';

import { useRoomMembers } from './useRoomMembers';

function getRoleBadge(powerLevel: number) {
  if (powerLevel >= 100)
    return { label: translate('Bot'), cls: 'badge-secondary' };
  if (powerLevel >= 50)
    return { label: translate('Admin'), cls: 'badge-primary' };
  return null;
}

function getMembershipBadge(membership: string) {
  if (membership === 'invite')
    return { label: translate('Invited'), cls: 'badge-warning' };
  return null;
}

export const MatrixMembersList: FC = () => {
  const members = useRoomMembers();

  return (
    <div className="p-3">
      <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem' }}>
        {translate('Members')} ({members.length})
      </div>
      <div className="d-flex flex-column gap-1">
        {members.map((m) => {
          const roleBadge = getRoleBadge(m.powerLevel);
          const membershipBadge = getMembershipBadge(m.membership);
          return (
            <div
              key={m.userId}
              className={`d-flex align-items-center gap-2 py-1 ${m.membership === 'invite' ? 'opacity-50' : ''}`}
              style={{ fontSize: '0.85rem' }}
            >
              <div
                className="rounded-circle bg-gray-300 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 28, height: 28, fontSize: '0.75rem' }}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-truncate flex-grow-1">{m.name}</span>
              {roleBadge && (
                <span
                  className={`badge ${roleBadge.cls}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {roleBadge.label}
                </span>
              )}
              {membershipBadge && (
                <span
                  className={`badge ${membershipBadge.cls}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {membershipBadge.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
