import {
  ArrowRightIcon,
  CheckCircleIcon,
  FileTextIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Card, Collapse } from 'react-bootstrap';

import { translate } from '@/i18n';

export const TwoStageWorkflowCard: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="card-bordered mb-6">
      <Card.Header
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className="d-flex align-items-center justify-content-between">
          <Card.Title className="mb-0">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <span className="text-primary">?</span>
              {translate('How does the review process work?')}
            </h5>
          </Card.Title>
          <span className="text-muted small">
            {isExpanded ? translate('Hide details') : translate('Show details')}
          </span>
        </div>
      </Card.Header>
      <Collapse in={isExpanded}>
        <div>
          <Card.Body>
            <p className="text-muted mb-4">
              {translate(
                'The review process has two stages. Understanding these stages helps you know what to expect.',
              )}
            </p>

            {/* Two Stage Visual */}
            <div className="d-flex flex-column flex-md-row gap-4 mb-6">
              {/* Stage 1 */}
              <div className="flex-fill">
                <div className="card card-bordered bg-light-primary h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle bg-primary p-3">
                        <UsersIcon
                          size={24}
                          weight="bold"
                          className="text-white"
                        />
                      </div>
                      <div>
                        <span className="badge badge-primary mb-1">
                          {translate('Stage 1')}
                        </span>
                        <h5 className="mb-0">{translate('Join the Pool')}</h5>
                      </div>
                    </div>
                    <p className="mb-3">
                      {translate(
                        'By accepting this invitation, you join the reviewer pool for this call. This means:',
                      )}
                    </p>
                    <ul className="mb-0">
                      <li className="d-flex align-items-start gap-2 mb-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'You agree to potentially review proposals for this call',
                          )}
                        </span>
                      </li>
                      <li className="d-flex align-items-start gap-2 mb-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'No specific proposals are assigned yet at this stage',
                          )}
                        </span>
                      </li>
                      <li className="d-flex align-items-start gap-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'Your expertise will be matched to suitable proposals',
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="d-none d-md-flex align-items-center">
                <ArrowRightIcon
                  size={32}
                  weight="bold"
                  className="text-muted"
                />
              </div>
              <div className="d-flex d-md-none justify-content-center">
                <ArrowRightIcon
                  size={32}
                  weight="bold"
                  className="text-muted"
                  style={{ transform: 'rotate(90deg)' }}
                />
              </div>

              {/* Stage 2 */}
              <div className="flex-fill">
                <div className="card card-bordered bg-light-success h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle bg-success p-3">
                        <FileTextIcon
                          size={24}
                          weight="bold"
                          className="text-white"
                        />
                      </div>
                      <div>
                        <span className="badge badge-success mb-1">
                          {translate('Stage 2')}
                        </span>
                        <h5 className="mb-0">
                          {translate('Receive Assignments')}
                        </h5>
                      </div>
                    </div>
                    <p className="mb-3">
                      {translate(
                        'Later, the call manager will assign specific proposals to you. At that time:',
                      )}
                    </p>
                    <ul className="mb-0">
                      <li className="d-flex align-items-start gap-2 mb-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'You will receive an email with your assigned proposals',
                          )}
                        </span>
                      </li>
                      <li className="d-flex align-items-start gap-2 mb-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'You can accept or decline each proposal individually',
                          )}
                        </span>
                      </li>
                      <li className="d-flex align-items-start gap-2">
                        <CheckCircleIcon
                          size={18}
                          weight="bold"
                          className="text-success mt-1 flex-shrink-0"
                        />
                        <span>
                          {translate(
                            'You can declare conflicts of interest at that time',
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-light rounded p-4">
              <h6 className="fw-bold mb-3">
                {translate('Frequently Asked Questions')}
              </h6>
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="fw-bold text-gray-800">
                    {translate('How many proposals will I need to review?')}
                  </div>
                  <div className="text-muted small">
                    {translate(
                      'The number of assignments depends on the call configuration and your expertise match. You will be notified of specific assignments and can decline if your workload is too high.',
                    )}
                  </div>
                </div>
                <div>
                  <div className="fw-bold text-gray-800">
                    {translate('What if I have a conflict of interest?')}
                  </div>
                  <div className="text-muted small">
                    {translate(
                      'When you receive specific proposal assignments (Stage 2), you can declare any conflicts of interest. The system may also automatically detect some conflicts based on institutional affiliations or co-authorship.',
                    )}
                  </div>
                </div>
                <div>
                  <div className="fw-bold text-gray-800">
                    {translate('Can I change my mind after accepting?')}
                  </div>
                  <div className="text-muted small">
                    {translate(
                      "If circumstances change, contact the call manager. They can remove you from the pool if necessary, though it's best to commit only if you expect to be available.",
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};
