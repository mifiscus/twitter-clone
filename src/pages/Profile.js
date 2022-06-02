import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from '../components/Auth/AuthContext'
import './Profile.css'

import useFetchListen from '../components/Hooks/useFetchListen';
import useBatchQuery from '../components/Hooks/useBatchQuery';
import useFollow from '../components/Hooks/useFollow';

import Sidebar from '../components/Sidebar/Sidebar'
import Widgets from '../components/Widgets/Widgets'
import Post from '../components/Post/Post'
import Retweet from '../components/Retweet/Retweet'
import EditProfile from '../components/EditProfile/EditProfile'

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import moment from 'moment'

const Profile = () => {
    const { currentUser, currentUserData } = useAuth();
    const navigate = useNavigate();

    const path = window.location.pathname;
    const path_user = path.replace('/user/', '');
    const followersLink = path + '/followers';
    const followingLink = path + '/following';

    const userJoined = moment(currentUser.metadata.creationTime).format('MMMM, YYYY');

    // Fetch this profile's user doc
    const [profileUser, setProfileUser] = useState(null);
    const { 
        document: profileDoc, 
        loading: profileLoad, 
        error: profileError 
    } = useFetchListen('users', 'username', path_user);
    useEffect(() => {
        if (profileDoc !== null) {
            setProfileUser(profileDoc);
        }
    }, [profileDoc])

    // Fetch this profile's list of posts
    const [posts, setPosts] = useState([]);
    const { 
        document: profilePosts, 
        loading: postLoad, 
        error: postError 
    } = useBatchQuery('posts', profileUser?.posts);
    useEffect(() => {
        // Order by date
        const sortPosts = (temp) => {
            const sorted = temp.sort((a, b) => {
            return moment(b.timestamp).diff(a.timestamp);
            });
            return sorted;
        }

        if (profilePosts !== null) {
            setPosts(sortPosts(profilePosts));
        }
    }, [profilePosts])

    // Follow and unfollow hook
    const { followUser, unfollowUser } = useFollow();

    if (profileLoad || postLoad) {
        return <h1>LOADING...</h1>;
    }
    
    return (
        <React.Fragment>
            <Sidebar />
            <div className='profile'>
                <div className='profile__topper'>
                    <div className='profile__arrow'>
                        <ArrowBackIcon 
                            onClick={ () => navigate(-1) } 
                            style={{ fontSize: 20 }} 
                        />
                    </div>
                    <div className='profile__topperSub'>
                        <p className='profile__topperName'>
                            { profileUser?.displayName }
                        </p>
                        <p className='profile__topperTweets'>
                            { posts.length } Tweets
                        </p>
                    </div>
                </div>
                <div className='profile__header'>
                    <div className='profile__banner' />
                    <Avatar className='profile__image' 
                            src={ profileUser?.image ? 
                                profileUser?.image 
                                : 
                                '' 
                            } 
                    />
                    { (path_user === currentUserData.username) ? 
                        <EditProfile user={ profileUser } />
                        : 
                        (currentUserData.following.includes(profileUser?.docID)) ?
                            <Button 
                                variant='outlined' 
                                className='profile__followButton' 
                                onClick={ () => unfollowUser(profileUser.docID) }
                            >
                                Unfollow
                            </Button>
                            :
                            <Button 
                                variant='outlined' 
                                className='profile__followButton' 
                                onClick={ () => followUser(profileUser.docID) }
                            >
                                Follow
                            </Button>

                    }
                    <div className='profile__names'>
                        <h3>{ profileUser?.displayName }</h3>
                        <p>@{ profileUser?.username }</p>
                    </div>
                    <div className='profile__userInfo'>
                        <p className='profile__userBio'>{ profileUser?.bio }</p>
                        <p className='profile__userDate'>
                            <CalendarMonthOutlinedIcon style={{ fontSize: 15 }}/> 
                            &nbsp;Joined { userJoined }
                        </p>
                        <div className='profile__userFollow'>
                            <div className='profile__userFollowing'>
                                <Link 
                                    to={ followingLink } 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <p style={{ 
                                        fontWeight: 700, 
                                        color: 'var(--twitter-black)' 
                                    }}>
                                        { profileUser?.following?.length }&nbsp;
                                    </p> 
                                    <p style={{ color: 'var(--twitter-gray)' }}>
                                        following
                                    </p>
                                </Link>
                            </div>
                            <div className='profile__userFollowers'>
                                <Link 
                                    to={ followersLink } 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <p style={{ 
                                        fontWeight: 700, 
                                        color: 'var(--twitter-black)' 
                                    }}>
                                        { profileUser?.followers?.length }&nbsp;
                                    </p> 
                                    <p style={{ color: 'var(--twitter-gray)' }}>
                                        followers
                                    </p>
                                </Link>
                            </div>
                            
                        </div>
                    </div>
                    
                </div>
                <div className='profile__tweets'>
                    <div className='profile__tweetHeader'>
                        <div className='profile__tweetHeaderActive'>Tweets</div>
                        <div className='profile__tweetHeaderOption'>Tweets & Replies</div>
                        <div className='profile__tweetHeaderOption'>Media</div>
                        <div className='profile__tweetHeaderOption'>Likes</div>
                    </div>

                    
                    { posts.map(post => (
                        // Check if post is a retweet or not
                        (post.originalID) ? 
                            <Retweet 
                                originalID={ post.originalID }
                                userID={ profileUser.docID }
                                timestamp={ post.timestamp }
                                key={ post.docID }
                                id={ post.docID }
                            /> 
                            :
                            <Post 
                                userID={ profileUser.docID }
                                text={ post.content }
                                timestamp={ post.timestamp }
                                likes={ post.likes }
                                retweets={ post.retweets }
                                replies={ post.replies }
                                key={ post.docID }
                                id={ post.docID }
                                replyTweetID={ post.replyTweetID }
                            />
                    )) }
                </div>
            </div>
            <Widgets />
        </React.Fragment>

    )
}

export default Profile;