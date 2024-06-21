import React from 'react';


export const useDrawerController = () => {
    const [ isOpen, setOpen ] = React.useState(false);
    const toggleDrawer = () => setOpen((isOpen) => !isOpen);

    return {
        isOpen,
        setOpen,
        toggleDrawer
    };
};


