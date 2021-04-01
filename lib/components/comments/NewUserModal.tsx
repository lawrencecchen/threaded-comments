import { Transition } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import supabase from '@lib/utils/initSupabase';
import { useUser } from '@lib/hooks/use-user';
import { useModal } from '@lib/hooks/use-modal';
import Avatar from './Avatar';

const NewUserModal = (): JSX.Element => {
  const { user, profile, refresh } = useUser();
  const { isOpen: show, close } = useModal('newUserModal');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [fullNameError, setFullNameError] = useState<any>(null);
  const [usernameError, setUserNameError] = useState<any>(null);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }

    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user?.user_metadata.full_name);
    }

    if (user?.user_metadata?.avatar_url) {
      setImageURL(user?.user_metadata?.avatar_url);
    }
  }, [user]);

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>): Promise<void> {
    if (!user) throw new Error('Not signed in');
    e.preventDefault();
    if (fullName.length > 5000) {
      return setFullNameError('Is your name really this long?');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username })
      .match({ id: user.id });

    if (error) {
      console.log(error);
      if (error.code === '23505') {
        return setUserNameError({ message: 'This username is already taken.' });
      }
      return setFullNameError('Something went wrong. Please try again or contact support.');
    }

    setFullNameError(null);
    if (data) {
      await refresh();
      close('newUserModal');
    }
  }

  return (
    <Transition show={show}>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="relative items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-50" />
            </div>
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          ></span>

          <div
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 w-full sm:text-left">
                    <h1
                      className="text-2xl leading-6 font-medium text-gray-900 dark:text-white"
                      id="modal-headline"
                    >
                      Welcome!
                    </h1>
                    <p className="my-2 text-sm dark:text-gray-200">
                      Continuing as <span className="font-bold">{user?.email}</span>{' '}
                      <button
                        className="text-indigo-500 hover:underline focus:outline-none focus:underline"
                        aria-label="Sign out"
                        onClick={() => supabase.auth.signOut()}
                      >
                        (not you?)
                      </button>
                    </p>
                    <div className="my-2">
                      <form onSubmit={handleSubmit}>
                        <label className="block mb-2">
                          <div className="mb-1 text-left">Your name:</div>
                          <input
                            type="text"
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                            className="block text-sm w-full dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-75"
                            placeholder="Jane Eyre"
                            maxLength={300}
                          />
                        </label>
                        {fullNameError && (
                          <div className="text-sm text-red-600">{fullNameError.message}</div>
                        )}

                        <label className="block mb-2">
                          <div className="mb-1 text-left">Your username:</div>
                          <div className="flex rounded-md shadow-sm ">
                            <span className="inline-flex dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              @
                            </span>
                            <input
                              type="text"
                              onChange={(e) => setUsername(e.target.value)}
                              value={username}
                              className="block text-sm w-full dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-none rounded-r-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-75"
                              placeholder="janeausten"
                              maxLength={300}
                            />
                          </div>
                        </label>
                        {usernameError && (
                          <div className="text-sm text-red-600">{usernameError.message}</div>
                        )}

                        <label className="block mb-2">
                          <div className="mb-1 text-left">Your avatar:</div>
                          <div className="flex">
                            <Avatar
                              profile={profile}
                              firstLetter={'L'}
                              className="w-8 h-8 text-sm"
                            />
                            <input
                              type="file"
                              className="ml-2 focus-ring border border-gray-300 rounded-md px-2 py-1 font-medium text-sm"
                            />
                          </div>
                        </label>

                        <button
                          type="submit"
                          className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-500 text-base font-medium text-white hover:bg-indigo-600 focus-ring sm:w-auto sm:text-sm"
                          aria-label="Done"
                        >
                          Done
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default NewUserModal;
