import React from 'react';

const Ping = (): JSX.Element => {
  return (
    <span className="flex absolute right-0 top-0 transform translate-x-full -translate-y-full">
      <span className=" bg-green-500 absolute opacity-50 animate-ping h-2 w-2 rounded-full" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 opacity-75" />
    </span>
  );
};

export default Ping;
