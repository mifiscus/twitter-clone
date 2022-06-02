import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { Link, useNavigate } from 'react-router-dom'
import './Post.css'
import { useClickOutside } from '../Hooks/useClickOutside'

import { useAuth } from '../Auth/AuthContext'
import db from '../../firebase'
import { 
        doc, 
        onSnapshot, 
        updateDoc, 
        arrayUnion, 
        arrayRemove, 
        collection, 
        setDoc, 
        query,
        where,
        getDocs,
        docs,
        deleteDoc,
        getDoc
    } from "firebase/firestore"

import VerifiedIcon from '@mui/icons-material/Verified';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IosShareIcon from '@mui/icons-material/IosShare';
import Avatar from '@mui/material/Avatar';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import GroupRemoveOutlinedIcon from '@mui/icons-material/GroupRemoveOutlined';

const Post = ({
    id,
    userID,
    verified,
    timestamp,
    text,
    avatar,
    replies,
    likes,
    retweets,
    isRetweet,
    replyTweetID
}) => {

    const { currentUser, currentUserData } = useAuth();
    const [liked, setLiked] = useState(false);
    const [retweeted, setRetweeted] = useState(false);
    const [clicked, setClicked] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        setClicked(!clicked);
    }

    // Set domNode to use custom hook to detect when user has clicked outside of target div
    const domNode = useClickOutside(() => {
        setClicked(false);
    });

    const getTime = (timestamp) => {
        const difference = moment(timestamp).fromNow();
        
        // Moment method returns 'date' if timestamp is over 24 hours ago, so return formatted
        // date if over 24 hours, otherwise return set moment messages from App.js
        if (difference === 'date') {
            return moment(timestamp).format('MMM D, YYYY');
        } else {
            return difference;
        }
    }

    const postRef = doc(db, 'posts', id);
    const userRef = doc(db, 'users', currentUser.uid);

    // Fetch data about author of post
    const [postAuthor, setPostAuthor] = useState({});
    useEffect(() => {
        const authorRef = collection(db, 'users');
        const q = query(authorRef, where('__name__', '==', userID));
        const unsub = onSnapshot(q, (querySnapshot) => {
            setPostAuthor(querySnapshot.docs.map((doc) => doc.data())[0]);
        });

        return () => {
            unsub();
        }
    }, []);

    const handleLike = async (e) => {
        e.preventDefault(); // Prevent route change from happening from Link component
        await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid)
        })
    }

    const handleUnlike = async (e) => {
        e.preventDefault();
        await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid)
        })
    }

    const handleDelete = async (e) => {
        e.preventDefault();
        // Find all retweets of this post and delete them from the post collection
        const q = query(collection(db, 'posts'), where('originalID', '==', id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            deleteRetweets(doc);
        })

        // Find all replies to this post and delete them from the post collection
        const q1 = query(collection(db, 'posts'), where('replyTweetID', '==', id));
        const querySnapshot1 = await getDocs(q1);
        querySnapshot.forEach((doc) => {
            deleteReplies(doc);
        })

        // Delete postID from user's post list
        await updateDoc(userRef, {
            posts: arrayRemove(id)
        });

        // Delete post from posts collection
        await deleteDoc(postRef);
    }

    const deleteRetweets = async (document) => {
        // Delete the retweet from the user's post list
        const docRef = doc(db, 'users', document.data().userID)
        await updateDoc(docRef, {
            posts: arrayRemove(document.id)
        });

        // Delete retweet of the post from the post collection
        const postRef = doc(db, 'posts', document.id);
        await deleteDoc(postRef);
    }

    const deleteReplies = async (document) => {
        // Delete reply post from user's post list
        const docRef = doc(db, 'users', document.data().userID);
        await updateDoc(docRef, {
            posts: arrayRemove(document.id)
        });

        // Delete reply post from the post collection
        const postRef = doc(db,'posts', document.id);
        await deleteDoc(postRef);
    }

    useEffect(() => {
        // Check if user has liked this post to change like button render
        const unsub = onSnapshot(doc(db, 'posts', id), (doc) => {
            if (doc.data().likes.includes(currentUser.uid)) {
                setLiked(true);
            } else {
                setLiked(false);
            }
        })
        return () => {
            unsub();
        }

    }, [])

    const handleRetweet = async (e) => {
        e.preventDefault();
        // Enter posts collection, create new doc with userID, originalID,
        // and timestamp fields
        const newPostRef = doc(collection(db, 'posts'));
        await setDoc(newPostRef, {
            userID: currentUser.uid,
            originalID: id,
            timestamp: moment().format()  // current time with ISO 8601 format
        });

        // Add user to the list of users that have retweeted this post
        await updateDoc(postRef, {
            retweets: arrayUnion(currentUser.uid)
        });

        // Save this new post ID and add it to the posts field of the user's doc
        await updateDoc(userRef, {
            posts: arrayUnion(newPostRef.id)
        });
    }

    const handleUnretweet = async (e) => {
        e.preventDefault();
        // Search posts for post with field of current postID, then use the ID from that
        // to delete the corresponding field from user's post list
        const q = query(collection(db, 'posts'), where('originalID', '==', id), where('userID', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const retweetID = querySnapshot.docs.map(doc => doc.id).toString();
        
        await updateDoc(userRef, {
            posts: arrayRemove(retweetID)
        });

        // Delete the user from the list of users that have retweeted this post
        await updateDoc(postRef, {
            retweets: arrayRemove(currentUser.uid)
        })

        // Delete post document from posts collection
        await deleteDoc(doc(db, 'posts', retweetID));

    }

    useEffect(() => {
        // Check if user has retweeted this post to change retweet button render
        const unsub = onSnapshot(doc(db, 'posts', id), (doc) => {
            if (doc.data().retweets.includes(currentUser.uid)) {
                setRetweeted(true);
            } else {
                setRetweeted(false);
            }
        })

        return () => {
            unsub();
        }
    }, [])

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


    const [reply, setReply] = useState({});
    const [replyUser, setReplyUser] = useState({});
    const renderReply = () => {
        return (
            <div className='post__reply' onClick={ routeChangeReply }>
                <div className='post__replyHeader'>
                    <Avatar     sx={{ width: 20, height: 20, mr: 1 }} 
                                src={ replyUser.image ? 
                                        replyUser.image : 
                                        avatar 
                                }
                    />
                    <p>{ replyUser.displayName }</p>
                    <span>@{ replyUser.username } · { getTime(reply.timestamp) }</span>
                </div>
                <div className='post__replyBody'>
                    { reply.content }
                </div>

            </div>
        )
    }

    // If this post is a reply, render the original post
    useEffect(() => {
        const getReplyPost = async () => {
            const postRef = doc(db, 'posts', replyTweetID);
            const postSnap = await getDoc(postRef);
            getReplyUser(postSnap.data().userID);
            setReply({ ...postSnap.data(), postID: postSnap.id });
        }

        const getReplyUser = (ID) => {   
            const  userRef = doc(db, 'users', ID);
            const unsub = onSnapshot(userRef, (doc) => {
                setReplyUser(doc.data());
            })
        }

        if (replyTweetID !== undefined) {
            getReplyPost();
        }

    }, [])

    const navigate = useNavigate();
    const routeChangeReply = (e) => {
        e.preventDefault();
        navigate('/status/' + reply.postID);
    }

    const routeChangeUser = (e) => {
        e.preventDefault();
        navigate('/user/' + postAuthor.username);
    }

    const routeChangeRetweet = (e) => {
        e.preventDefault();
        navigate('/user/' + isRetweet[1]);
    }
    
    return (
        <div className='post' style={ isRetweet !== undefined ? { paddingTop: 25 } : { paddingTop: 0 } }>
            <Link to={ '/status/' + id } className='post__Link'>
                { isRetweet !== undefined ? 
                    <div className='post__retweet' onClick={ routeChangeRetweet }>
                        <RepeatIcon fontSize='small' />&nbsp;
                        { isRetweet[2] === currentUser.uid ? 'You' : isRetweet[0] } Retweeted
                    </div> 
                    : 
                    <div />
                }
                <div className='post__avatar'>
                    <Avatar     sx={{ width: 48, height: 48, m: -1 }} 
                                src={ postAuthor.image ? 
                                        postAuthor.image : 
                                        avatar 
                                }
                    />
                </div>

                <div className='post__body'>
                    <div className='post__header'>
                        <div className='post__headerText' onClick={ routeChangeUser }>
                            <h3>
                                <span className='post__displayName'>{ postAuthor.displayName } </span>
                                <span className='post__headerSpecial'>
                                    { verified && <VerifiedIcon className='post__badge' /> }
                                    &nbsp;@{ postAuthor.username } ·&nbsp;
                                    { getTime(timestamp) }
                                </span>
                            </h3>
                            <div className='post__headerMenu' ref={ domNode } onClick={ handleClick }>
                                <MoreHorizIcon />
                                <ul className={ clicked ? 'post__headerMenuList active' : 'post__headerMenuList' }>
                                    {// Check if this is the current user's post, then either display delete tweet
                                    // function or follow/unfollow function
                                    (currentUser.uid === userID) ? 
                                        <li className='post__headerMenuListItem' onClick={ handleDelete }>
                                            <DeleteOutlineIcon sx={{ color: 'var(--twitter-gray)', mx: 1 }} />
                                            Delete Post
                                        </li>
                                        :
                                        // Check if current user is following this user
                                        (currentUserData.following.includes(userID)) ?
                                            <li className='post__headerMenuListItem' onClick={ () => handleUnfollow(userID) }>
                                                <GroupRemoveOutlinedIcon sx={{ color: 'var(--twitter-gray)', mx: 1 }} />
                                                Unfollow
                                            </li>
                                            :
                                            <li className='post__headerMenuListItem' onClick={ () => handleFollow(userID) }>
                                                <GroupAddOutlinedIcon sx={{ color: 'var(--twitter-gray)', mx: 1 }} />
                                                Follow
                                            </li>

                                    }
                                </ul>
                            </div>
                            
                        </div>
                        <div className='post__headerDescription'>
                            <p>{ text }</p>
                        </div>
                    </div>
                    { (replyTweetID !== undefined) && renderReply()
                    }
                    { (likes === undefined || retweets === undefined) ? 
                        <div /> 
                        :
                        <div className='post__footer'>
                            <div className='post__replies'>
                                <div className='post__repliesIcon'>
                                    <ChatBubbleOutlineIcon fontSize='small' />
                                </div>
                                
                                <span className='post__numbers'>{ replies.length }</span>
                            </div>
                            { retweeted ?
                                <div className='post__retweeted' onClick={ handleUnretweet }>
                                    <div className='post__retweetsIcon'>
                                        <RepeatIcon fontSize='small' />
                                    </div>
                                    <span className='post__numbers'>{ retweets.length }</span>
                                </div>
                                :
                                <div className='post__retweets' onClick={ handleRetweet }>
                                    <div className='post__retweetsIcon'>
                                        <RepeatIcon fontSize='small' />
                                    </div>
                                    <span className='post__numbers'>{ retweets.length }</span>
                                </div>
                            }
                            { liked ? 
                                <div className='post__liked' onClick={ handleUnlike }>
                                    <div className='post__likesIcon'>
                                        <FavoriteIcon fontSize='small' />
                                    </div>
                                    <span className='post__numbers'>{ likes.length }</span>
                                </div>
                                : 
                                <div className='post__likes' onClick={ handleLike }>
                                    <div className='post__likesIcon'>
                                        <FavoriteBorderIcon fontSize='small' />
                                    </div>
                                    <span className='post__numbers'>{ likes.length }</span>
                                </div>
                            }
                            
                            <div className='post__replies'>
                                <div className='post__repliesIcon'>
                                    <IosShareIcon fontSize='small' />
                                </div>
                            </div>
                        </div> 
                    }
                    
                </div>
            </Link>
        </div>
    )
}

export default Post