import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../../firebase'
import {    createUserWithEmailAndPassword, 
            signInWithEmailAndPassword,
            sendPasswordResetEmail,
            deleteUser
        } from 'firebase/auth';

import db from '../../firebase'
import { doc, 
    getDoc,
    query,
    collection,
    where,
    onSnapshot
} from 'firebase/firestore'

const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState();
    const [currentUserData, setCurrentUserData] = useState({
        bio: '',
        displayName: '',
        email: '',
        followers: [],
        following: [],
        image: '',
        posts: [],
        username: ''
    });
    const [loading, setLoading] = useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const logout = () => {
        return auth.signOut();
    }

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    }

    const deleteAccount = () => {
        return deleteUser(currentUser);
    }

    const getUserData = async (user) => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        return docSnap.data();
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);

            const q = query(collection(db, 'users'), where('__name__', '==', user.uid));
            const unsub = onSnapshot(q, (querySnapshot) => {
                const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id }));
                setCurrentUserData(temp[0]);
            });

            return () => {
                unsub();
            }
            
        })

        return unsubscribe
    }, [])

    useEffect(() => {
        
    }, [])
    

    const value = {
        currentUser,
        currentUserData,
        signup,
        login, 
        logout,
        resetPassword,
        deleteAccount,
        getUserData
    }

    return (
        <AuthContext.Provider value={ value }>
            { !loading && children }
        </AuthContext.Provider>
    )
}
