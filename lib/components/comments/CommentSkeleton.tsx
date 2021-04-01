import React from 'react';
import cn from 'classnames';

const generateRandom = (max: number, min: number): number => {
  if (typeof window !== 'undefined') {
    return Math.random() * (max - min) + min;
  }

  return 0;
};

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: any;
}

const Skeleton = ({ children = null, className, style }: Props): JSX.Element => (
  <div
    className={cn('skeleton dark:skeleton-dark', className)}
    style={style}
    suppressHydrationWarning
  >
    {children}
  </div>
);

const CommentSkeleton = ({ innerRef = null }) => (
  <div className="py-3" ref={innerRef}>
    <div className="grid pb-1 gap-x-3 gap-y-1 comment-grid">
      <Skeleton className="grid row-start-1 col-start-1 place-items-center rounded-full w-7 h-7"></Skeleton>
      <div className="row-start-2 row-end-5 col-start-1 col-end-2 row-span-auto flex justify-center my-1 px-1">
        <Skeleton className="flex justify-center border-none group focus-ring w-px mb-1"></Skeleton>
      </div>
      <div className="row-start-1 col-start-2 self-center flex">
        <Skeleton className="w-28 h-3 rounded-sm" />
      </div>
      <div className="row-start-2 col-start-2">
        <div className="space-y-2 py-2">
          <Skeleton
            className="h-2 rounded-sm w-10/12"
            // style={{ width: `${generateRandom(100, 85)}%` }}
          />
          <Skeleton
            className="h-2 rounded-sm w-full"
            // style={{ width: `${generateRandom(100, 85)}%` }}
          />
          <Skeleton
            className="h-2 rounded-sm w-9/12"
            // style={{ width: `${generateRandom(100, 85)}%` }}
          />
        </div>
        <div className="flex items-center mt-2">
          <Skeleton className="w-8 h-3 rounded-sm mr-3" />
          <Skeleton className="w-10 h-3 rounded-sm" />
        </div>
      </div>
    </div>
  </div>
);

export default CommentSkeleton;
