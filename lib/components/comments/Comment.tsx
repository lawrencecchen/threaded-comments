import NewCommentForm from '@lib/components/comments/NewCommentForm';
// import { useComments } from '@lib/hooks/use-comments';
import Plus from '@lib/icons/Plus';
import supabase from '@lib/utils/initSupabase';
import type { CommentType } from '@lib/utils/types';
// import { useUser } from '@lib/hooks/use-user';
import cn from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import VoteButtons from './VoteButtons';
import Avatar from './Avatar';

const MAX_LINES = 10;
const LINE_HEIGHT = 24; // in px
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT;

interface ReplyFormProps {
  comment: CommentType;
  handleResetCallback: () => void;
}
const ReplyForm = ({ comment, handleResetCallback }: ReplyFormProps): JSX.Element => {
  const [hidden, setHidden] = useState<boolean>(false);
  return (
    <div
      className={cn(
        'my-2 border-b border-t border-gray-200 dark:border-gray-600 transform -translate-x-2 -mr-2',
        { hidden }
      )}
    >
      <NewCommentForm
        parentId={comment.id}
        autofocus={true}
        handleResetCallback={handleResetCallback}
        hideEarlyCallback={() => setHidden(true)}
      />
    </div>
  );
};

interface Props {
  comment: CommentType;
  pageIndex?: number;
  highlight?: boolean;
  parent?: CommentType | null;
}

const Comment = ({ comment, pageIndex, highlight = false, parent = null }: Props): JSX.Element => {
  const [hidden, setHidden] = useState(false);
  const [isOverflowExpanded, setIsOverflowExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = false;
  // const { mutateComments } = useComments();
  // const { data: isAdmin } = useSWR(
  //   user?.id ? ['user_owns_siteId', user.id] : null,
  //   async (_, userId) =>
  //     supabase
  //       .from('sites')
  //       .select('*')
  //       .then(({ data, error }) => data?.[0])
  // );
  // console.log(comment);

  useEffect(() => {
    if (contentRef && contentRef.current) {
      const el = contentRef.current;

      if (el.scrollHeight > MAX_HEIGHT) {
        setIsOverflow(true);
      }
    }
  }, []);

  async function handleDelete() {
    const { data } = await supabase
      .from('posts')
      .update({
        isDeleted: true,
        content: '[Deleted]',
        title: '[Deleted]',
      })
      .eq('id', comment.id);
    // mutateComments(comment.mutateKey);
  }

  async function handleApprove() {
    const { data } = await supabase
      .from('posts')
      .update({
        isApproved: true,
      })
      .eq('id', comment.id);
    // mutateComments(comment.mutateKey);
  }

  async function handleDeny() {
    const { data } = await supabase
      .from('posts')
      .update({
        isPublished: false,
        isApproved: false,
      })
      .eq('id', comment.id);
    // mutateComments(comment.mutateKey);
  }

  async function handleBan(): Promise<void> {
    return;
  }

  async function handlePin(): Promise<void> {
    return;
  }

  return (
    <div className="flex flex-col">
      {!hidden && parent && (
        <div className="grid pb-1 gap-x-2 comment-grid">
          <div className="w-6 relative">
            <div className="col-start-1 border-gray-200 border-t-2 border-l-2 rounded-tl box-border absolute -right-1 bottom-0 w-2/3 h-1/2" />
          </div>
          <div className="col-start-2 flex items-center leading-none mb-1 transform translate-y-1">
            <button
              className="text-xs text-gray-500 hover:underline focus-ring active:underline cursor-pointer focus:outline-none"
              aria-label={`View comment by ${parent.author?.full_name}`}
            >
              @{parent.author?.full_name}:
            </button>
            <div className="text-xs text-gray-500 ml-1 hover:text-gray-400 focus-ring active:text-gray-400 cursor-pointer focus:outline-none line-clamp-1">
              {parent.content}
            </div>
          </div>
        </div>
      )}
      <div
        className={cn('grid gap-x-3 comment-grid transition-opacity', {
          'opacity-60': !comment.live,
          'gap-y-1': !hidden,
        })}
      >
        {highlight && (
          <>
            <div className="row-start-1 col-start-1 row-end-3 col-end-3 -m-1 opacity-5 bg-indigo-700 dark:bg-indigo-50 dark:border-gray-100 rounded shadow-2xl pointer-events-none" />
          </>
        )}
        {!hidden ? (
          <>
            <div className="grid row-start-1 col-start-1 place-items-center focus-ring">
              <Avatar profile={comment.author} isDeleted={comment.isDeleted} />
            </div>
            <div className="row-start-2 row-end-5 col-start-1 col-end-2 row-span-auto flex justify-center my-1 px-1">
              <button
                className={cn(
                  'flex-grow flex justify-center border-none group focus-ring mb-1',
                  hidden
                )}
                onClick={() => setHidden(true)}
                aria-label={`Collapse comment by ${comment.author}`}
              >
                <div
                  className={cn('w-px h-full', {
                    'bg-gray-200 group-hover:bg-gray-500 group-active:bg-gray-500 dark:bg-gray-600 dark:group-hover:bg-gray-400 dark:group-active:bg-gray-400': !highlight,
                    'bg-gray-300 group-hover:bg-gray-600 group-active:bg-gray-600 dark:bg-gray-600 dark:group-hover:bg-gray-400 dark:group-active:bg-gray-400': highlight,
                  })}
                />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setHidden(false)}
            className={
              'row-start-1 col-start-1 grid place-items-center border-none border-box focus-ring w-7 h-7'
            }
            aria-label={`Expand comment by ${comment.author}`}
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <div className="row-start-1 col-start-2 self-center">
          <div className="flex flex-grow items-end">
            <span
              className={cn('text-gray-700 dark:text-gray-100 leading-none', {
                'text-sm font-medium': !hidden,
                'text-xs': hidden,
              })}
            >
              {!comment.isDeleted ? comment.author?.full_name : <>[Deleted]</>}{' '}
            </span>
            <span className="text-gray-300 dark:text-gray-500 font-semibold text-xs mx-1 leading-none select-none">
              ·
            </span>
            <span
              className="text-gray-400 text-xs font-light leading-none"
              suppressHydrationWarning
            >
              {dayjs().diff(comment.createdAt, 'seconds', true) < 30
                ? 'just now'
                : dayjs(comment.createdAt).fromNow()}
            </span>
            {isAdmin && (
              <button
                className="text-xs flex flex-row items-center text-gray-600 dark:text-gray-400 focus-ring border-none ml-5 leading-none"
                onClick={handlePin}
                aria-label={`Pin comment by ${comment.author?.full_name}`}
              >
                Pin comment
              </button>
            )}
          </div>
        </div>

        <div className={cn('row-start-2 col-start-2', { hidden })}>
          <section
            className={cn('text-gray-800 dark:text-gray-300 leading-6 text-sm', {
              'line-clamp-10': !isOverflowExpanded,
              hidden,
            })}
            ref={contentRef}
          >
            {comment.content}
          </section>
          {isOverflow && (
            <button
              className="text-sm text-indigo-700 dark:text-indigo-400 hover:underline focus:underline focus-ring border border-transparent leading-none"
              onClick={() => setIsOverflowExpanded(!isOverflowExpanded)}
              aria-label={`Pin comment by ${comment.author?.full_name}`}
            >
              {isOverflowExpanded ? <span>Show less</span> : <span>Read more</span>}
            </button>
          )}
          {!comment.isDeleted && (
            <div className="grid grid-flow-col auto-cols-min gap-x-3 transform -translate-x-1.5">
              <VoteButtons comment={comment} />
              <button
                className="text-xs flex items-center text-gray-600 dark:text-gray-400 focus-ring border-none"
                onClick={() => setShowReplyForm(!showReplyForm)}
                aria-label={
                  showReplyForm
                    ? `Hide reply form`
                    : `Reply to comment by ${comment.author?.full_name}`
                }
              >
                {showReplyForm ? <span>Cancel</span> : <span>Reply</span>}
              </button>
              {isAdmin && (
                <>
                  {!comment.isApproved && (
                    <button
                      className="text-xs flex flex-row items-center text-gray-600 dark:text-gray-400 focus-ring border-none"
                      onClick={handleApprove}
                      aria-label={`Approve comment by ${comment.author?.full_name}`}
                    >
                      Approve
                    </button>
                  )}
                  {comment.isApproved && (
                    <button
                      className="text-xs flex flex-row items-center text-gray-600 dark:text-gray-400 focus-ring border-none"
                      onClick={handleDeny}
                      aria-label={`Unapprove comment by ${comment.author?.full_name}`}
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    className="text-xs text-red-600 flex flex-row items-center focus-ring border-none"
                    onClick={handleDelete}
                    aria-label={`Delete comment by ${comment.author?.full_name}`}
                  >
                    Delete
                  </button>
                  <button
                    className="text-xs text-red-600 flex flex-row items-center focus-ring border-none whitespace-nowrap"
                    onClick={handleBan}
                    aria-label={`Ban ${comment.author?.full_name}`}
                  >
                    Ban user
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className={cn('row-start-3 row-span-2  transform -translate-x-2 -mr-2', { hidden })}>
          {showReplyForm && (
            <div className="px-2">
              <ReplyForm comment={comment} handleResetCallback={() => setShowReplyForm(false)} />
            </div>
          )}

          {comment.responses.length > 0 && (
            <div className={cn('pt-2 space-y-5')}>
              {comment.responses.map((comment: CommentType) => (
                <Comment
                  key={comment.slug}
                  comment={comment}
                  pageIndex={pageIndex}
                  highlight={comment.highlight}
                />
              ))}
            </div>
          )}
        </div>

        {comment.continueThread && comment.responses?.length === 0 && (
          <div className="flex items-center">
            <button
              className={cn(
                'mt-5 text-xs inline-flex items-center text-gray-600 focus-ring border border-transparent',
                { hidden }
              )}
              aria-label={`Continue thread`}
            >
              <div className="h-px w-8 bg-gray-400 dark:bg-gray-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                {`View ${comment.responsesCount === 1 ? 'reply' : 'replies'} (${
                  comment.responsesCount
                })`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
