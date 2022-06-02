import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import Widgets from '../components/Widgets/Widgets'
import ShowUser from '../components/ShowUser/ShowUser'

import { NavLink, useNavigate } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useAuth } from '../components/Auth/AuthContext'

import db from '../firebase'
import {    collection, 
            query,
            where,
            getDocs,
            onSnapshot
        } from 'firebase/firestore'

import './Profile.css'

const Follow = () => {

    const path = window.location.pathname;
    let path_user = '';
    const followers = useRef(true);   // flag to check which list to query and render
    const isMounted = useRef(false); // mutable flag
    const [users, setUsers] = useState([]);

    const { currentUserData } = useAuth();

    const navigate = useNavigate();


    // Check path to determine if current page should render following or follower list
    if (path.includes('following')) {
        path_user = path.replace('/user/', '').replace('/following', '');
        followers.current = false;
    } else if (path.includes('followers')) {
        path_user = path.replace('/user/', '').replace('/followers', '');
        followers.current = true;
    }
    
    const path_followers = path.replace(path.substring(path.length - 9), 'followers');
    const path_following = path.replace(path.substring(path.length - 9), 'following');

    const [profileUser, setProfileUser] = useState({displayName: '',followers: [], following: [], posts: []});

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', path_user));

        // Attach a listener so the lists are updated when the user interacts with
        // the Follow/Unfollow buttons
        const unsub = onSnapshot(q, (querySnapshot) => {
            const temp = querySnapshot.docs.map(doc => (doc.data()));
            setProfileUser(temp[0]);
        });

        return () => {
            unsub();
        }

    }, [path])


    useEffect(() => {

        // Prevent function from running before the profile state is set so the database
        // doesn't throw an error trying to read documents from an empty ID array
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        // Batch query users based on current user's following/followers list
        const getFollowUsers = async (followIDs) => {
            const usersRef = collection(db, 'users');
            let temp = [];

            while(followIDs.length) {
                const batch = followIDs.splice(0, 10);
                const q = query(usersRef, where('__name__', 'in', batch));

                const querySnapshot = await getDocs(q);
                temp.push(querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id })));
            }

            setUsers(temp.flat());
        }

        // Detect current page and either render followers list or following list
        let q;
        if (followers.current) {
            getFollowUsers(profileUser.followers);
        } else if (!followers.current) {
            getFollowUsers(profileUser.following);
        }

    }, [profileUser])

    return (
        <React.Fragment>
            <Sidebar />
            <div className='profile'>
                <div className='follow__topperContainer'>
                    <div className='profile__topper'>
                        <div className='profile__arrow'>
                            <ArrowBackIcon onClick={() => navigate(-1)} style={{ fontSize: 20 }} />
                        </div>
                        <div className='profile__topperSub'>
                            <p className='profile__topperName'>{ profileUser.displayName }</p>
                            <p className='profile__topperTweets'>@{ profileUser.username }</p>
                        </div>
                        
                    </div>
                    <div className='follow__topperTabs'>
                        <NavLink 
                            to={ path_followers } 
                            className={({ isActive }) =>
                                isActive ? 
                                    'follow__topperActive' : 
                                    'follow__topperFollow'
                        }>
                            Followers
                        </NavLink>
                        <NavLink 
                            to={ path_following } 
                            className={({ isActive }) =>
                                isActive ? 
                                    'follow__topperActive' : 
                                    'follow__topperFollow'
                        }>
                            Following
                        </NavLink>
                    </div>
                </div>
                { users.map(user => (
                    <ShowUser 
                        displayName={ user.displayName }
                        username={ user.username }
                        bio={ user.bio }
                        key={ user.userID }
                        id={ user.userID }
                        followingList={ currentUserData.following }
                    />
                )) }
                
            </div>
            <Widgets />
        </React.Fragment>
    )
}

export default Follow