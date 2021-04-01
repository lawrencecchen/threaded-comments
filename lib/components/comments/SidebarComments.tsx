import CommentsList from '@lib/components/comments/CommentsList';
import NewCommentForm from '@lib/components/comments/NewCommentForm';
import { NoAnimationSidebar } from '@lib/components/comments/Sidebar';
import { useComments } from '@lib/hooks/use-comments';
import { X } from '@lib/icons/X';
import Portal from '@reach/portal';
import { useEffect, useState } from 'react';
import SortCommentsSelect from './SortCommentsSelect';

function removeHash(): void {
  let scrollV, scrollH;
  const loc = window.location;
  if ('pushState' in history) history.pushState('', document.title, loc.pathname + loc.search);
  else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = '';

    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

const SidebarComments = (): JSX.Element => {
  const [showComments, setShowComments] = useState(false);
  const { count } = useComments();

  function handleCloseRemarq(): void {
    setShowComments(false);

    if (typeof window !== 'undefined') {
      removeHash();
      // window.location = ('' as unknown) as Location;
      // const url = new URL(window.location + "");
      // url.searchParams.delete("remarq-comments");
      // history.pushState({}, "", url + "");
    }
  }

  function handleHashChange(): void {
    // console.log(location.hash, e);
    if (location.hash === '#comments') {
      setShowComments(true);
    }
  }

  useEffect(() => {
    if (history.scrollRestoration) {
      // Back off, browser, I got this...
      history.scrollRestoration = 'manual';
    }
    window.addEventListener('hashchange', handleHashChange);

    if (location.hash === '#comments') {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Portal>
      <NoAnimationSidebar isOpen={showComments} handleClose={handleCloseRemarq}>
        <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 min-h-screen max-h-screen">
          <div className="flex-none flex flex-row items-center justify-between py-3 sm:py-4 px-3 sm:px-6 order-first">
            <h2 className="text-xl font-semibold dark:text-gray-100">
              Responses {count && <span>({count})</span>}
            </h2>
            <button
              onClick={handleCloseRemarq}
              className="border border-transparent focus-ring rounded-full"
              aria-label="Close sidebar comments"
            >
              <X className="text-gray-800 dark:text-gray-100 w-6" />
            </button>
          </div>

          <div className="flex border-t border-gray-200 dark:border-gray-600 px-3 sm:px-6 sm:static fixed bottom-0 left-0 right-0 z-10 bg-inherit">
            <NewCommentForm />
          </div>

          <div className="flex-grow flex flex-col overflow-hidden">
            <CommentsList useInfiniteScroll={true} />
          </div>

          <div className="min-h-14 block sm:hidden"></div>
        </div>
      </NoAnimationSidebar>
    </Portal>
  );
};

export default SidebarComments;
