import { definitions } from '@lib/types/supabase';
import React from 'react';
import cn from 'classnames';

interface Props {
  profile?: definitions['profiles'] | null;
  className?: string | { [key: string]: any };
  isDeleted?: boolean;
  firstLetter?: string;
}

const Avatar = ({
  profile,
  className = 'w-7 h-7 text-sm',
  isDeleted,
  firstLetter,
}: Props): JSX.Element => {
  if (isDeleted) {
    return (
      <div
        className={cn('rounded-full border border-white shadow-sm bg-gray-500', className)}
      ></div>
    );
  }

  if (firstLetter) {
    return (
      <div
        className={cn(
          'rounded-full border border-white bg-indigo-600 text-white shadow-sm flex items-center justify-center capitalize font-light',
          className
        )}
      >
        {firstLetter}
      </div>
    );
  }

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        className={cn('rounded-full border border-white shadow-sm object-cover', className)}
        alt={profile?.full_name}
        width={28}
        height={28}
      />
    );
  }

  if (profile?.full_name) {
    return (
      <div
        className={cn(
          'rounded-full border border-white bg-indigo-600 text-white shadow-sm flex items-center justify-center capitalize font-light',
          className
        )}
      >
        {profile?.full_name?.[0]}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'skeleton rounded-full border border-white bg-indigo-600 text-white shadow-sm flex items-center justify-center capitalize font-light',
        className
      )}
    ></div>
  );
};

export default Avatar;
