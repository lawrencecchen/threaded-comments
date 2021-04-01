// import { votesReducer } from '@lib/components/comments/VoteButtons';
import Heart from '@lib/icons/Heart';
import supabase from '@lib/utils/initSupabase';
import { useUser } from '@lib/hooks/use-user';
import cn from 'classnames';
import React from 'react';
import useSWR from 'swr';
import { definitions } from '@lib/types/supabase';
import { invokeVote } from '@lib/components/comments/VoteButtons';
import { useModal } from '@lib/hooks/use-modal';
import { useComments } from '@lib/hooks/use-comments';

const HeartButton = (): JSX.Element => {
  const { user } = useUser();
  const { postId } = useComments();
  const { data: comment, mutate } = useSWR(['posts', postId, user], async (_, postId, _user) =>
    supabase
      .from<definitions['comments_thread_with_user_vote']>('comments_thread_with_user_vote')
      .select('*')
      .eq('id', postId)
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw error;
        }

        return data?.[0] as definitions['comments_thread_with_user_vote'];
      })
  );
  const { open } = useModal();

  async function handleVote(): Promise<void> {
    if (!user) return open('signInModal');
    if (!comment || !comment.id) return;

    if (comment.userVoteValue === 0) {
      mutate((data) => ({ ...data, votes: (comment.votes || 0) + 1, userVoteValue: 1 }), false);
      await invokeVote(comment.id, user.id, 1);
    } else {
      mutate((data) => ({ ...data, votes: (comment.votes || 0) - 1, userVoteValue: 0 }), false);
      await invokeVote(comment.id, user.id, 0);
    }
  }

  return (
    <button
      className="flex items-center focus-ring p-1 text-gray-600 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-50 text-sm"
      onClick={handleVote}
    >
      <Heart
        className={cn('w-6 h-6 stroke-1.5', {
          'text-red-600 fill-current': comment?.userVoteValue === 1,
        })}
      />
      <span className="ml-1 tabular-nums min-w-[12px]">{comment ? comment.votes : `-`}</span>
    </button>
  );
};

export default HeartButton;
