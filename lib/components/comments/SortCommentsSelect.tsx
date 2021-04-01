import React from 'react';
import { useComments, SortingBehavior } from '@lib/hooks/use-comments';

const SortCommentsSelect = (): JSX.Element => {
  const { sortingBehavior, setSortingBehavior } = useComments();

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>): void {
    setSortingBehavior(e.target.value as SortingBehavior);
  }
  return (
    <select
      className="text-gray-800 text-xs my-2 rounded-md border-gray-300 focus-ring max-w-[5rem] dark:bg-gray-800 dark:text-gray-200"
      onChange={handleSelect}
      value={sortingBehavior}
      aria-label="Sort votes by"
    >
      <option value="pathVotesRecent">Top</option>
      <option value="pathMostRecent">New</option>
      <option value="pathLeastRecent">Old</option>
    </select>
  );
};

export default SortCommentsSelect;
