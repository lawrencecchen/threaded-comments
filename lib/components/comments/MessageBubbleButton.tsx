import React from 'react';

import MessageBubble from '@lib/icons/MessageBubble';
import { useComments } from '@lib/hooks/use-comments';

const MessageBubbleButton = (): JSX.Element => {
  const { count } = useComments();
  return (
    <button className="block focus-within-ring" aria-label="View comments">
      <a
        href="#comments"
        className="p-1 flex items-center transition-color text-gray-600 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-50 text-sm"
      >
        <MessageBubble className="w-6 h-6" />
        <span className="ml-1">{count ? count : `-`}</span>
      </a>
    </button>
  );
};

export default MessageBubbleButton;
