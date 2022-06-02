import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/Auth/AuthContext'
import {    collection, 
            query, 
            onSnapshot,  
            doc, 
            updateDoc, 
            arrayUnion,
            arrayRemove,
            getDocs,
            deleteField
        } from 'firebase/firestore'
import db from '../firebase'

const Users = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [following, setFollowing] = useState([]);

    

    const handleFollow = async followID => {
        // Add the id of the new user into the user's database document (following field)
        const userDocument = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocument, {
          following: arrayUnion(followID)
        })

        const followDocument = doc(db, 'users', followID);
        await updateDoc(followDocument, {
          followers: arrayUnion(currentUser.uid)
        })
        
    }

    const handleUnfollow = async followID => {
        const userDocument = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocument, {
          following: arrayRemove(followID)
        })

        const followDocument = doc(db, 'users', followID);
        await updateDoc(followDocument, {
          followers: arrayRemove(currentUser.uid)
        })
    }

    useEffect(() => {
        // Get list of all documents from database, and map them to the posts array while
        // also listening for changes to the documents (add post, delete post, edit post)
        
        
        // Get post data
        const q = query(collection(db, 'users'));
        let temp = [];
        const unsub = onSnapshot(q, (querySnapshot) => {
            temp = querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id }));
            setUsers(temp);
        }); 

        // Fetch list of users the current user is following
        const unsub2 = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
            setFollowing(doc.data().following);
        })

        return () => {
            unsub();
            unsub2();
        }
    }, [])


    const handleChange = async () => {
        const postRef = collection(db, 'posts');

        const querySnapshot = await getDocs(postRef);
        querySnapshot.forEach((document) => {
            const docRef = doc(db, 'posts', document.id);
            updateDocument(docRef);
        })
    }

    const updateDocument = async (docRef) => {
        await updateDoc(docRef, {
            comments: deleteField(),
            replies: []
        });
    }

    return (
        <div>
            { users.map(user => (!following.includes(user.userID) ?
                (
                    <div key={ user.userID }>
                        { user.username }
                        { user.displayName }
                        { user.userID }
                        <button onClick={() => handleFollow(user.userID) }>follow</button>
                    </div>
                    
                ) :
                (
                    <div key={ user.userID }>
                        { user.username }
                        { user.displayName }
                        { user.userID }
                        <button onClick={() => handleUnfollow(user.userID) }>unfollow</button>
                    </div>
                    
                )
            ))}

            <button onClick={ handleChange }>CHANGE ALL</button>
        </div>
    )
}

export default Users