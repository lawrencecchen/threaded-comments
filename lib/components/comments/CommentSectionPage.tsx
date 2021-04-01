// import React, { useEffect } from 'react';
// import useSWR from 'swr';
// import supabase from '@utils/initSupabase';
// import { CommentType } from '@utils/types';
// import Comment from '@components/comments/Comment';
// import CommentSkeleton from '@components/comments/CommentSkeleton';
// import { MAX_DEPTH, PAGE_SIZE } from '@constants/pagination';
// import { useUser } from '@utils/useUser';

// interface Props {
//   pageIndex: number;
//   parentSlug: string;
//   handleDoneLoadingCallback: any;
// }

// const CommentSectionPage = ({ pageIndex, parentSlug, handleDoneLoadingCallback = null }: Props) => {
//   const { user } = useUser();
//   const { data, error, mutate } = useSWR<CommentType>(
//     [`post_by_root_slug`, pageIndex, user?.id],
//     async (_, pageIndex, userId) =>
//       supabase
//         .rpc('get_post_by_slug', {
//           root_slug: parentSlug,
//           max_depth: MAX_DEPTH,
//           responses_limit: PAGE_SIZE,
//           responses_offset: PAGE_SIZE * pageIndex,
//           user_id: userId,
//         })
//         .then(({ data, error }) => {
//           if (error) throw error;
//           return (data as unknown) as CommentType;
//         }),
//     { revalidateOnFocus: false }
//   );

//   useEffect(() => {
//     if (data) {
//       handleDoneLoadingCallback?.();
//     }
//   }, [data]);

//   if (error) {
//     console.log(error);
//     return <div className="italic text-center text-gray-600">Something went wrong.</div>;
//   }

//   if (!data?.responses) {
//     return <CommentSkeleton />;
//   }

//   return (
//     <>
//       {data.responses.map((comment: CommentType) => (
//         <div className="py-3" key={comment.slug}>
//           <Comment
//             comment={comment}
//             pageIndex={pageIndex}
//             highlight={comment.highlight}
//             mutate={mutate}
//           />
//         </div>
//       ))}
//     </>
//   );
// };

// export default CommentSectionPage;

export {};
