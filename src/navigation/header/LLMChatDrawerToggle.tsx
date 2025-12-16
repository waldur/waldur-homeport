import { SparkleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { isFeatureVisible } from '@waldur/features/connect';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

const LLMChatDrawer = lazyComponent(() =>
  import('@waldur/ai-assistant/components/LLMChatDrawer').then((module) => ({
    default: module.LLMChatDrawer,
  })),
);

export const LLMChatDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  if (!isFeatureVisible(SupportFeatures.enable_llm_assistant)) {
    return null;
  }

  const openChatDrawer = () => {
    dispatch(
      openDrawerDialog(LLMChatDrawer, {
        title: translate('AI Assistant'),
        size: 'lg',
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="llm-chat-drawer-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={openChatDrawer}
        title={translate('Open AI Assistant')}
      >
        <span className="svg-icon svg-icon-2">
          <SparkleIcon weight="bold" />
        </span>
      </button>
    </div>
  );
};
