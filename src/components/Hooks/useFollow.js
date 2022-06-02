import React from 'react'
import { useAuth } from '../Auth/AuthContext'
import db from '../../firebase'
import {    
    doc, 
    updateDoc, 
    arrayUnion,
    arrayRemove
} from 'firebase/firestore'

const useFollow = () => {

    const { currentUser } = useAuth();
    const docRef = doc(db, 'users', currentUser.uid);

    const followUser = async (followID) => {
        // Add ID of the new user into the user's database document (following field)
        await updateDoc(docRef, {
            following: arrayUnion(followID)
        })

        // Add ID of current user into followed user's followers field
        const followDocument = doc(db, 'users', followID);
        await updateDoc(followDocument, {
            followers: arrayUnion(currentUser.uid)
        })
    }

    const unfollowUser = async (followID) => {
        await updateDoc(docRef, {
            following: arrayRemove(followID)
        })

        const followDocument = doc(db, 'users', followID);
        await updateDoc(followDocument, {
            followers: arrayRemove(currentUser.uid)
        })
    }

    return { followUser, unfollowUser };

}

export default useFollow;