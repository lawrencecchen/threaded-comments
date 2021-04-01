import { useComments } from '@lib/hooks/use-comments';
import { useUser } from '@lib/hooks/use-user';
import Heart from '@lib/icons/Heart';
import ThumbsUpFilled from '@lib/icons/ThumbUpFilled';
import ThumbsUpOutlined from '@lib/icons/ThumbUpOutlined';
import supabase from '@lib/utils/initSupabase';
import type { CommentType } from '@lib/utils/types';
import cn from 'classnames';
import React from 'react';
import { useModal } from '@lib/hooks/use-modal';

type StatusType = 'upvoted' | 'unvoted' | 'downvoted';

export async function invokeVote(postId: number, userId: string, value: number): Promise<any> {
  return supabase
    .from('votes')
    .upsert([{ postId, userId, value }], {
      onConflict: 'postId, userId',
    })
    .then(({ data, error }) => {
      if (error) {
        console.log(error);
        throw error;
      }

      return data;
    });
}

export const mutateVotes = (
  mutate: any,
  postId: number,
  incrementBy: number,
  userVoteValue: number
): Promise<any> =>
  mutate(
    (pages: CommentType[][]) =>
      pages.map((comments) =>
        comments.map((comment) => {
          if (comment.id === postId) {
            const newComment = {
              ...comment,
              votes: comment.votes + incrementBy,
              userVoteValue,
            };

            return newComment;
          }
          return comment;
        })
      ),
    false
  );

function resolveStatus(userVoteValue: number | undefined | null): StatusType {
  if (userVoteValue === 1) return 'upvoted';
  if (userVoteValue === -1) return 'downvoted';
  return 'unvoted';
}

interface Props {
  comment: CommentType;
  config?: {
    type?: 'heart' | 'thumbs';
    canDownvote?: boolean;
  };
}

const VoteButtons = ({
  comment,
  config = { type: 'thumbs', canDownvote: true },
}: Props): JSX.Element | null => {
  const { user } = useUser();
  const { mutateComments } = useComments();
  const status = resolveStatus(comment.userVoteValue);
  const { open } = useModal();

  function handleUpvote(): void {
    if (!user || !user.id) return open('signInModal');

    if (status === 'unvoted') {
      invokeVote(comment.id, user.id, 1);
      mutateVotes(mutateComments, comment.id, 1, 1);
    } else if (status === 'upvoted') {
      invokeVote(comment.id, user.id, 0);
      mutateVotes(mutateComments, comment.id, -1, 0);
    } else if (status === 'downvoted') {
      invokeVote(comment.id, user.id, 1);
      mutateVotes(mutateComments, comment.id, 2, 1);
    }
  }

  function handleDownvote(): void {
    if (!user || !user.id) return open('signInModal');

    if (status === 'unvoted') {
      invokeVote(comment.id, user.id, -1);
      mutateVotes(mutateComments, comment.id, -1, -1);
    } else if (status === 'upvoted') {
      invokeVote(comment.id, user.id, -1);
      mutateVotes(mutateComments, comment.id, -2, -1);
    } else if (status === 'downvoted') {
      invokeVote(comment.id, user.id, 0);
      mutateVotes(mutateComments, comment.id, 1, 0);
    }
  }

  if (!comment) return null;

  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400">
      {config.type === 'heart' ? (
        <button
          className="text-xs flex items-center focus-ring p-1"
          onClick={handleUpvote}
          aria-label="Like this comment"
        >
          <Heart
            className={cn('w-4 h-4', {
              'text-red-600 fill-current': status === 'upvoted',
              'stroke-1.5': status !== 'upvoted',
            })}
          />
          <span className="ml-1 text-gray-600 dark:text-gray-400 tabular-nums">
            {comment.votes}
          </span>
        </button>
      ) : (
        <>
          <button
            className="text-xs flex items-center focus-ring p-1.5"
            onClick={handleUpvote}
            aria-label="Like this comment"
          >
            {status === 'upvoted' && <ThumbsUpFilled className="w-4 h-4 text-indigo-500" />}
            {status !== 'upvoted' && (
              <ThumbsUpOutlined className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          <span className="text-gray-600 dark:text-gray-400 text-xs tabular-nums min-w-[12px] text-center mx-1">
            {comment.votes}
          </span>
          {config.canDownvote && (
            <button
              className="text-sm flex items-center focus-ring p-1.5"
              onClick={handleDownvote}
              aria-label="Dislike this comment"
            >
              {status === 'downvoted' && (
                <ThumbsUpFilled className="w-4 h-4 text-indigo-500 transform rotate-180" />
              )}
              {status !== 'downvoted' && (
                <ThumbsUpOutlined className="w-4 h-4 text-gray-500 dark:text-gray-400 transform rotate-180" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VoteButtons;
