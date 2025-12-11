import { PlusIcon, XIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Alert, Badge } from 'react-bootstrap';

import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

interface K8sSecurityRule {
  id: string;
  name: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  port_range_min: number;
  port_range_max: number;
  cidr: string;
  direction: 'ingress' | 'egress';
  description?: string;
}

interface K8sSecurityRulesFieldProps extends FormField {
  field: {
    label?: string;
    help_text?: string;
    required?: boolean;
    rule_type: 'public_access' | 'administrative_access';
  };
}

const DEFAULT_RULES = {
  public_access: [
    {
      id: 'http-ingress',
      name: 'HTTP Ingress',
      protocol: 'TCP' as const,
      port_range_min: 80,
      port_range_max: 80,
      cidr: '0.0.0.0/0',
      direction: 'ingress' as const,
      description: 'Allow HTTP traffic from anywhere',
    },
    {
      id: 'https-ingress',
      name: 'HTTPS Ingress',
      protocol: 'TCP' as const,
      port_range_min: 443,
      port_range_max: 443,
      cidr: '0.0.0.0/0',
      direction: 'ingress' as const,
      description: 'Allow HTTPS traffic from anywhere',
    },
  ],
  administrative_access: [
    {
      id: 'ssh-admin',
      name: 'SSH Access',
      protocol: 'TCP' as const,
      port_range_min: 22,
      port_range_max: 22,
      cidr: '10.0.0.0/8',
      direction: 'ingress' as const,
      description: 'SSH access from internal networks',
    },
    {
      id: 'k8s-api',
      name: 'Kubernetes API',
      protocol: 'TCP' as const,
      port_range_min: 6443,
      port_range_max: 6443,
      cidr: '10.0.0.0/8',
      direction: 'ingress' as const,
      description: 'Kubernetes API server access',
    },
  ],
};

const K8sSecurityRulesField: React.FC<K8sSecurityRulesFieldProps> = ({
  field,
  input,
}) => {
  const user = useUser();
  const rules = input?.value || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<K8sSecurityRule>>({
    protocol: 'TCP',
    direction: 'ingress',
    cidr: '0.0.0.0/0',
  });

  const addDefaultRules = () => {
    let defaultRules = DEFAULT_RULES[field.rule_type] || [];
    const existingRuleIds = new Set(rules.map((rule) => rule.id));

    // For administrative access rules, use user's IP address if available
    if (field.rule_type === 'administrative_access' && user?.ip_address) {
      const userCidr = `${user.ip_address}/32`; // Single IP address with /32 subnet
      defaultRules = defaultRules.map((rule) => ({
        ...rule,
        cidr: userCidr,
        description: `${rule.description} (your current IP: ${user.ip_address})`,
      }));
    }

    const newRules = defaultRules.filter(
      (rule) => !existingRuleIds.has(rule.id),
    );

    if (input?.onChange) {
      input.onChange([...rules, ...newRules]);
    }
  };

  const addCustomRule = () => {
    if (!newRule.name || !newRule.port_range_min) return;

    const rule: K8sSecurityRule = {
      id: `custom-${Date.now()}`,
      name: newRule.name,
      protocol: newRule.protocol || 'TCP',
      port_range_min: newRule.port_range_min,
      port_range_max: newRule.port_range_max || newRule.port_range_min,
      cidr: newRule.cidr || '0.0.0.0/0',
      direction: newRule.direction || 'ingress',
      description: newRule.description,
    };

    if (input?.onChange) {
      input.onChange([...rules, rule]);
    }

    setNewRule({
      protocol: 'TCP',
      direction: 'ingress',
      cidr: '0.0.0.0/0',
    });
    setShowAddForm(false);
  };

  const removeRule = (ruleId: string) => {
    if (input?.onChange) {
      input.onChange(rules.filter((rule) => rule.id !== ruleId));
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <Row className="align-items-center">
          <Col>
            <h6 className="mb-0">
              <ShieldCheckIcon className="me-2" size={16} weight="bold" />
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </h6>
            {field.help_text && (
              <small className="text-muted">{field.help_text}</small>
            )}
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addDefaultRules}
              className="me-2"
            >
              {field.rule_type === 'administrative_access' && user?.ip_address
                ? translate('Add Default Rules (Your IP: {ip})', {
                    ip: user.ip_address,
                  })
                : translate('Add Default Rules')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusIcon size={14} className="me-1" weight="bold" />
              {translate('Add Custom Rule')}
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {rules.length === 0 ? (
          <Alert variant="info">
            {translate(
              'No security rules configured. Add default rules or create custom ones.',
            )}
          </Alert>
        ) : (
          <div>
            {rules.map((rule) => (
              <Card key={rule.id} className="mb-2 border-light">
                <Card.Body className="py-2">
                  <Row className="align-items-center">
                    <Col md={3}>
                      <strong>{rule.name}</strong>
                      {rule.description && (
                        <div>
                          <small className="text-muted">
                            {rule.description}
                          </small>
                        </div>
                      )}
                    </Col>
                    <Col md={2}>
                      <Badge bg="primary">{rule.protocol}</Badge>
                    </Col>
                    <Col md={2}>
                      {rule.port_range_min === rule.port_range_max
                        ? rule.port_range_min
                        : `${rule.port_range_min}-${rule.port_range_max}`}
                    </Col>
                    <Col md={2}>
                      <Badge
                        bg={rule.direction === 'ingress' ? 'success' : 'info'}
                      >
                        {rule.direction}
                      </Badge>
                    </Col>
                    <Col md={2}>
                      <code>{rule.cidr}</code>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                      >
                        <XIcon size={14} weight="bold" />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {showAddForm && (
          <Card className="mt-3 border-primary">
            <Card.Header className="bg-primary bg-opacity-10">
              <h6 className="mb-0">{translate('Add Custom Security Rule')}</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('Rule Name')} *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={translate('Enter rule name')}
                      value={newRule.name || ''}
                      onChange={(e) =>
                        setNewRule({ ...newRule, name: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('Protocol')} *</Form.Label>
                    <Form.Select
                      value={newRule.protocol || 'TCP'}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          protocol: e.target.value as any,
                        })
                      }
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('Port Range')} *</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Min"
                          value={newRule.port_range_min || ''}
                          onChange={(e) =>
                            setNewRule({
                              ...newRule,
                              port_range_min: parseInt(e.target.value),
                            })
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Max"
                          value={newRule.port_range_max || ''}
                          onChange={(e) =>
                            setNewRule({
                              ...newRule,
                              port_range_max: parseInt(e.target.value),
                            })
                          }
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('Direction')} *</Form.Label>
                    <Form.Select
                      value={newRule.direction || 'ingress'}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          direction: e.target.value as any,
                        })
                      }
                    >
                      <option value="ingress">{translate('Ingress')}</option>
                      <option value="egress">{translate('Egress')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('CIDR')} *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="0.0.0.0/0"
                      value={newRule.cidr || ''}
                      onChange={(e) =>
                        setNewRule({ ...newRule, cidr: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>{translate('Description')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={translate('Optional description')}
                      value={newRule.description || ''}
                      onChange={(e) =>
                        setNewRule({ ...newRule, description: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={addCustomRule}>
                  {translate('Add Rule')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  {translate('Cancel')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default K8sSecurityRulesField;
