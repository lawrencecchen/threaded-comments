import { definitions } from '@lib/types/supabase';
import supabase from '@lib/utils/initSupabase';
import { CommentType } from '@lib/utils/types';
import { NextApiRequest, NextApiResponse } from 'next';
import { arrayToTree } from 'performant-array-to-tree';

const postgresArray = (arr: any[]): string => `{${arr.join(',')}}`;

function createCommentsTree(data: CommentType[], postId: number) {
  const flattenedComments: CommentType[] = data ? data.flat() : [];

  const rootParentIds = flattenedComments
    .filter((comment: CommentType) => comment.parentId === postId)
    .map((comment: CommentType) => comment.parentId)
    .reduce(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue]: true,
      }),
      {}
    );

  const comments: CommentType[] = data
    ? (arrayToTree(flattenedComments, {
        dataField: null,
        childrenField: 'responses',
        rootParentIds,
      }) as CommentType[])
    : [];

  return comments;
}

// function getNextPage(comments: CommentType[], startRange: number, endRange: number) {
//   const range = endRange - startRange;
//   if (comments.length < )
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sortingBehavior = 'pathVotesRecent';
  const postId = +req.query.postId;
  const pageSize = 500;
  const startRange = +req.query?.start || 0;
  const endRange = +req.query?.end || startRange + pageSize - 1;
  console.log(startRange, endRange);
  const path = postgresArray([postId]);
  const { data: post, error: postError } = await supabase
    .from<definitions['comments_thread_with_user_vote']>('comments_thread_with_user_vote')
    .select('*')
    .eq('id', req.query.postId as string)
    .single();
  const { data: comments, error: commentsError, count: commentsCount } = await supabase
    .from<definitions['comments_thread_with_user_vote']>('comments_thread_with_user_vote')
    .select('*', { count: 'exact' })
    .contains('path', [postId])
    .gt(sortingBehavior, path)
    .order(sortingBehavior as any)
    .range(startRange, endRange);

  if (comments && post) {
    res.status(200).json({
      post,
      commentsCount,
      comments: createCommentsTree((comments as unknown) as CommentType[], postId),
      length: comments.length,
    });
  }
  if (commentsError) {
    console.log(commentsError);
  }
  if (postError) {
    console.log(postError);
  }
  res.status(404).end('Could not find post.');
}
