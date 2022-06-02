import React, { useEffect, useState } from 'react'

import db from '../../firebase'
import {    
    collection,
    onSnapshot, 
    query, 
    where 
} from 'firebase/firestore'

const useFetchListen = (collectionName, field, target) => {
    const [document, setDocument] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        setLoading(true);
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where(field, '==', target));
        
        const unsub = onSnapshot(q, (querySnapshot) => {
            const temp = querySnapshot.docs.map((doc) => ({ ...doc.data(), docID: doc.id }));
            // This hook will only be used to fetch 1 doc at a time, so ensure
            // only 1 doc is returned
            setDocument(temp[0]);
            
            
        }, (error) => {
            setError('Failed to fetch document from database.');
            console.log(error);
        });
        setLoading(false);


        return () => {
            unsub();
        }
    }, [target]);


    return { document, loading, error };

}

export default useFetchListen;