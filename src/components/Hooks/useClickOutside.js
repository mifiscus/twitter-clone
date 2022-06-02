import React, { useRef, useEffect } from 'react'

export const useClickOutside = (handler) => {

    const domNode = useRef();

    useEffect(() => {
        const maybeHandler = (event) => {
            if (!domNode.current.contains(event.target)) {
                handler();
            }
        }
        document.addEventListener('mousedown', maybeHandler);

        return () => {
            document.removeEventListener('mousedown', maybeHandler)
        }
    });

    return domNode;

}