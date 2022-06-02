import React, { useState, useEffect } from 'react'
import { useClickOutside } from '../Hooks/useClickOutside';

import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import db from '../../firebase'
import {    
    doc,
    updateDoc
} from 'firebase/firestore'

const EditProfile = (profileUser) => {

    const [editProfileClicked, setEditProfileClicked] = useState(false);
    const handleEditProfileClick = (e) => {
        e.preventDefault();
        setEditProfileClicked(!editProfileClicked);
    }

	// Set domNode to use custom hook to detect when user has clicked outside of 
    // target div
    const domNode = useClickOutside(() => {
        setEditProfileClicked(false);
    });

    const [editProfile, setEditProfile] = useState({    
        displayName: profileUser.user?.displayName, 
        bio: profileUser.user?.bio, 
        image: profileUser.user?.image 
    })
    // Every time user's profile changes, re-render the initial state
    useEffect(() => { setEditProfile({
        displayName: profileUser.user?.displayName, 
        bio: profileUser.user?.bio, 
        image: profileUser.user?.image 
    })}, [profileUser.user] )

    const handleChange = (e) => {
        e.preventDefault();
        setEditProfile((fields) => ({ ...fields, [e.target.id]: e.target.value}));
    }

    const sendEdit = async (e) => {
        e.preventDefault();

        // No changes
        if (editProfile === { 
            displayName: profileUser.user.displayName, 
            bio: profileUser.user.bio, 
            image: profileUser.user.image 
        }) {
            return;
        }

        const userRef = doc(db, 'users', profileUser.user.docID);
        await updateDoc(userRef, {
            displayName: editProfile.displayName,
            bio: editProfile.bio,
            image: editProfile.image
        });

        setEditProfileClicked(false);
    }

    return (
        <React.Fragment>
            <Button 
                variant='outlined' 
                className='profile__followButton' 
                onClick={ handleEditProfileClick }
            >
                Edit Profile
            </Button>
            { editProfileClicked ?
                <div>
                    <div className='thread__likeMenuBackground' />
                    <div className='thread__likeMenu' ref={ domNode }>
                        <div className='thread__likeMenuScrollBar'>
                            <div 
                                className='profile__topper' 
                                style={{ borderRadius: 16, padding: 0 }}
                            >
                                <div className='profile__arrow'>
                                    <CloseIcon 
                                        onClick={ handleEditProfileClick } 
                                        style={{ fontSize: 20 }} 
                                    />
                                </div>
                                <div className='profile__topperSub'>
                                    <p className='profile__topperName'>
                                        Edit profile
                                    </p>
                                </div>
                                <Button 
                                    className='profile__editButton' 
                                    type='submit' 
                                    onClick={ sendEdit }
                                >
                                    Save
                                </Button>
                            </div>
                            <div className='profile__editBanner' />
                            <Avatar    className='profile__editImage' 
                                src={ profileUser.user.image ? 
                                    profileUser.user.image 
                                    : 
                                    '' 
                                } 
                            />
                            <label className='profile__editName'>
                                <span>Name</span>
                                <input
                                    onChange={ handleChange }
                                    value={ editProfile.displayName }
                                    id='displayName'
                                    type='text'
                                />
                            </label>
                            <label className='profile__editBio'>
                                <span>Bio</span>
                                <input
                                    onChange={ handleChange }
                                    value={ editProfile.bio }
                                    id='bio'
                                    type='text'
                                />
                            </label>
                            <label 
                                className='profile__editName' 
                                style={{ marginTop: 25 }}
                            >
                                <span>Image link</span>
                                <input
                                    onChange={ handleChange }
                                    value={ editProfile.image }
                                    id='image'
                                    type='text'
                                />
                            </label>

                        </div>
                    </div>
                </div>
                :
                // Create empty div with domNode ref to prevent non existent event
                // error from being thrown
                <div ref={ domNode } /> 
            }
        </React.Fragment>
    )
}

export default EditProfile;