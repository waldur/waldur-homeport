import {
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PlayIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  callReviewerPoolsList,
  proposalReviewsList,
  reviewerProfilesMeRetrieve,
  ReviewerProfile,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
}

const StatCard: FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  variant = 'primary',
}) => {
  const variantClasses = {
    success: 'bg-light-success text-success',
    warning: 'bg-light-warning text-warning',
    danger: 'bg-light-danger text-danger',
    primary: 'bg-light-primary text-primary',
    secondary: 'bg-light-secondary text-secondary',
  };

  return (
    <div className="card card-bordered h-100">
      <div className="card-body d-flex align-items-center gap-4">
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle ${variantClasses[variant]}`}
          style={{ width: 48, height: 48 }}
        >
          {icon}
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fs-3 fw-bold">{value}</div>
          {subtitle && <div className="text-muted small">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

export const ReviewStatsWidgets: FC = () => {
  const user = useSelector(getUser);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['reviewer-profile-me-stats'],
    queryFn: async () => {
      try {
        const response = await reviewerProfilesMeRetrieve();
        return response.data as ReviewerProfile;
      } catch (error) {
        if ((error as any)?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  // Count reviews in progress (state = in_review)
  const { data: inProgressCount = 0 } = useQuery({
    queryKey: ['reviews-in-progress-count', user?.uuid],
    queryFn: async () => {
      const response = await proposalReviewsList({
        query: {
          reviewer_uuid: user?.uuid,
          state: ['in_review'],
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
    enabled: !!user?.uuid,
  });

  // Count pending invitations
  const { data: invitationsCount = 0 } = useQuery({
    queryKey: ['invitations-pending-count'],
    queryFn: async () => {
      const response = await callReviewerPoolsList({
        query: {
          invitation_status: ['pending'],
          my_invitations: true,
          page_size: 1,
        },
      });
      return fetchResultCount(response);
    },
  });

  if (profileLoading) {
    return null;
  }

  // Use stats from profile or default to zeros
  const stats = profile?.stats ?? {
    total_reviews_completed: 0,
    average_review_time_days: null,
  };

  return (
    <Row className="g-4">
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<EnvelopeIcon size={24} weight="bold" />}
          title={translate('Invitations')}
          value={invitationsCount}
          variant="primary"
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<PlayIcon size={24} weight="bold" />}
          title={translate('In progress')}
          value={inProgressCount}
          variant="warning"
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<CheckCircleIcon size={24} weight="bold" />}
          title={translate('Completed')}
          value={stats.total_reviews_completed}
          variant="success"
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<ClockIcon size={24} weight="bold" />}
          title={translate('Avg. review time')}
          value={
            stats.average_review_time_days !== null
              ? translate('{days} days', {
                  days: stats.average_review_time_days.toFixed(1),
                })
              : '-'
          }
          variant="secondary"
        />
      </Col>
    </Row>
  );
};
