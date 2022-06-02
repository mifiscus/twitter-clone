import React, { useEffect, useState } from 'react'

import db from '../../firebase'
import {    
    collection, 
    onSnapshot, 
    query, 
    where 
} from 'firebase/firestore'

const useBatchQuery = (collectionName, IDList) => {
    const [document, setDocument] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [lastList, setlastList] = useState(null);


    useEffect(() => {
        if (lastList === IDList) {
            return;
        }
        
        setLoading(true);
        const collectionRef = collection(db, collectionName);
        let temp = [];
        setlastList(IDList);
        // Firebase only allows query to search for maximum 10 IDs, so split up doc IDs
        // into batches of 10 and then attach listeners to each (for updates on post 
        // interactions)
        while(IDList?.length) {
            const batch = IDList.splice(0, 10);
            const q = query(collectionRef, where('__name__', 'in', batch));
            const unsub = onSnapshot(q, (querySnapshot) => {
                // Save each doc that has been modified since the last iteration
                const modified = [];
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type === 'modified') modified.push(
                        {   ...change.doc.data(),
                            docID: change.doc.id
                        }
                    );
                })
                
                // Get list of docs for this batch
                const docList = querySnapshot.docs.map(doc => 
                    ({  ...doc.data(), 
                        docID: doc.id
                    })
                )
                
                // If there has been a doc modification, don't concatenate list 
                // because you will end up with duplicate docs, instead find and 
                // replace old doc with updated information
                if (querySnapshot.docChanges().some(change => change.type === 'modified')) {
                    temp = temp.map(obj => modified.find(o => o.docID === obj.docID) || obj);
                } else {
                    temp = temp.concat(docList); 
                }
                setDocument(temp);

            }, (error) => {
                setError('Failed to fetch documents from database.');
                console.log(error);
            })
        }
 
        
        setLoading(false);
        return () => {
            //unsub();
        }
    }, [IDList]);

    return { document, loading, error };

}

export default useBatchQuery;
