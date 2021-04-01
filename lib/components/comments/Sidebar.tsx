import { Transition } from '@headlessui/react';
import cn from 'classnames';
import React from 'react';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  children?: React.ReactNode;
}

// const SidebarDepthContext = createContext(0);

export function NoAnimationSidebar({ isOpen, handleClose, children }: Props): JSX.Element {
  return (
    <div className={cn('flex', { 'fixed inset-0 z-50': isOpen })}>
      <button
        className={cn('opacity-5 bg-gray-900 flex-grow', {
          hidden: !isOpen,
        })}
        onClick={handleClose}
        aria-label="Close comments"
      ></button>
      <div
        className={cn(
          'flex-shrink-0 w-screen sm:max-w-sm sm:min-w-sidebar fixed top-0 right-0 shadow-2xl',
          {
            hidden: !isOpen,
          }
        )}
        aria-hidden={isOpen}
      >
        {children}
      </div>
    </div>
  );
}

function Sidebar({ isOpen, handleClose, children }: Props): JSX.Element {
  return (
    <Transition show={isOpen} unmount={false}>
      {/* Background overlay */}
      <Transition.Child
        enter="transition-opacity ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        unmount={false}
      >
        <button
          className="fixed top-0 left-0 opacity-20 w-screen h-screen z-10 bg-gray-300"
          onClick={handleClose}
          aria-label="Close modal"
        ></button>
      </Transition.Child>

      {/* Sliding sidebar */}
      <Transition.Child
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-x-10"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-10"
        as={React.Fragment}
        unmount={false}
      >
        <div className="w-full h-full sm:max-w-sm sm:min-w-sidebar fixed top-0 right-0 z-20 shadow-2xl">
          {children}
        </div>
      </Transition.Child>
    </Transition>
  );
}

// export function FramerMotionSidebar({ isOpen, handleClose, children }: Props) {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed top-0 left-0 opacity-20 w-screen h-screen z-10 bg-gray-200"
//             onClick={handleClose}
//           ></motion.div>
//           <motion.div
//             initial={{ opacity: 0, x: 40 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 40 }}
//             transition={{ ease: "easeOut" }}
//             className="w-full h-full sm:max-w-sm sm:min-w-sidebar fixed top-0 right-0 z-20 shadow-2xl"
//           >
//             {children}
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

// export default Sidebar;
