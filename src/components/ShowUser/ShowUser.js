import React, { useState } from 'react'
import '../Post/Post.css'

import VerifiedIcon from '@mui/icons-material/Verified';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import { Link } from 'react-router-dom'

import { useAuth } from '../Auth/AuthContext'
import {    doc, 
            updateDoc, 
            arrayUnion,
            arrayRemove
        } from 'firebase/firestore'
import db from '../../firebase'

const ShowUser = ({
    displayName,
    username,
    verified,
    bio,
    avatar,
    id, 
    followingList
}) => {

    const { currentUser } = useAuth();
    const [isShown, setIsShown] = useState(false);
    
    const handleFollow = async (followID) => {
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

    const handleUnfollow = async (followID) => {
        const userDocument = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocument, {
          following: arrayRemove(followID)
        })

        const followDocument = doc(db, 'users', followID);
        await updateDoc(followDocument, {
          followers: arrayRemove(currentUser.uid)
        })
    }

    return (
        <div className='showUser'>
            <Link to={ '/user/' + username } className='post__Link'>
                <div className='post__avatar'>
                    <Avatar sx={{ width: 48, height: 48, m: -0.5 }} src={ avatar }/>
                </div>   
                <div className='post__body'>
                    <div className='post__header'>
                        <div className='showUser__headerText'>
                            <h3>
                                { displayName }
                            </h3>
                            <p>
                                { verified && <VerifiedIcon className='post__badge' /> }
                                @{ username }
                            </p>
                        </div>
                        <div className='showUser__description'>
                            <p>{ bio }</p>
                        </div>
                    </div>
                </div>
            </Link> 
            { id !== currentUser.uid &&
                (followingList !== undefined ? 
                    (!followingList.includes(id) ? 
                        <Button className='showUser__follow' onClick={ () => handleFollow(id) }>Follow</Button> 
                        :
                        <Button className='showUser__follow' 
                                onClick={ () => handleUnfollow(id) }
                                onMouseEnter={ () => setIsShown(true) }
                                onMouseLeave={ () => setIsShown(false) }
                        >
                            { isShown ? 'Unfollow' : 'Following'}
                        </Button> 
                    ) 
                    : 
                    console.log(followingList))
            }  
        </div>
    )
}

export default ShowUser