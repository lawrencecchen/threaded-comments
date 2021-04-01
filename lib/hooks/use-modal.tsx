import React, { useState, useEffect, createContext, useContext } from 'react';
import Portal from '@reach/portal';
type key = string;

interface ModalContext {
  isOpen: boolean;
  openKeys: key[] | null;
  open: (key: key) => void;
  close: (key: key) => void;
}

interface ModalProviderProps {
  children?: React.ReactNode;
  [propName: string]: any;
}

const ModalContext = createContext<ModalContext>({
  isOpen: false,
  openKeys: [],
  open: () => null,
  close: () => null,
});

const ModalElementsMap = new Map<key, React.ElementType>();
const BASE_Z_INDEX = 999999;

const ModalProvider = (props: ModalProviderProps): JSX.Element => {
  // The top modal has the last key.
  const [openKeys, setOpenKeys] = useState<key[]>([]);

  function handleOpen(key: key): void {
    if (!openKeys.includes(key)) {
      setOpenKeys((keys) => [...keys, key]);
    }
  }

  function handleClose(): void {
    setOpenKeys((keys) => keys.slice(0, -1));
  }

  const value: ModalContext = {
    isOpen: openKeys.length > 0,
    openKeys,
    open: handleOpen,
    close: handleClose,
  };

  return (
    <ModalContext.Provider value={value} {...props}>
      {props.children}
      {openKeys.map((key, index) => {
        const ReactElement = ModalElementsMap.get(key);

        if (!ReactElement) return null;

        return (
          <Portal key={`${key}_${index}`}>
            <div style={{ zIndex: BASE_Z_INDEX + index }}>
              <ReactElement />
            </div>
          </Portal>
        );
      })}
    </ModalContext.Provider>
  );
};

interface UseModalProps {
  [key: string]: React.ElementType;
}

const useModal = (props?: UseModalProps | key): ModalContext => {
  const context = useContext(ModalContext);
  if (!props) {
    return context;
  }

  if (typeof props === 'string') {
    const key = props;

    if (!ModalElementsMap.get(key)) {
      throw new Error(`Key ${key} does not exist.`);
    }

    return { ...context, open: () => context.open(key), close: () => context.close(key) };
  }

  const elements = Object.entries(props);

  elements.forEach(([key, element]) => {
    ModalElementsMap.set(key, element);
  });

  return context;
};

export { ModalProvider, useModal };
// const {open, close} = useModal('sign_in_modal', SignInModalElement);
