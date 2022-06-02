import React, { useEffect, useState, useRef } from 'react'
import './Thread.css'
import './Profile.css'

import Sidebar from '../components/Sidebar/Sidebar'
import Widgets from '../components/Widgets/Widgets'
import Post from '../components/Post/Post'
import Retweet from '../components/Retweet/Retweet'
import ShowUser from '../components/ShowUser/ShowUser'

import moment from 'moment';

import { Link, useNavigate } from 'react-router-dom'
import { useClickOutside } from '../components/Hooks/useClickOutside'

import Button from '@mui/material/Button';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from '@mui/material/Avatar';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IosShareIcon from '@mui/icons-material/IosShare';
import CloseIcon from '@mui/icons-material/Close';

import db from '../firebase'
import { useAuth } from '../components/Auth/AuthContext'
import { 
    collection, 
    query, 
    onSnapshot, 
    doc, 
    where, 
    getDocs,
	updateDoc,
	arrayUnion,
	arrayRemove,
	setDoc,
	deleteDoc,
	addDoc,
	getDoc
} from 'firebase/firestore'

const Thread = () => {

	const path = window.location.pathname;
	const path_post = path.replace('/status/', '');

	const navigate = useNavigate();

	// Get post data
	const [post, setPost] = useState({ likes: [], retweets: [], replies: [] });
	useEffect(() => {
        // Fetch post
        const unsub = onSnapshot(doc(db, 'posts', path_post), (doc) => {
            setPost({ ...doc.data(), postID: doc.id });
        });
        return () => {
            unsub();
        }
    }, [])

	// Get post author data
	const [user, setUser] = useState({});
	const isMounted = useRef(false); // mutable flag
	useEffect(() => {

		if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        // Fetch user
        const unsub = onSnapshot(doc(db, 'users', post.userID), (doc) => {
            setUser(doc.data());
        });
        return () => {
            unsub();
        }
    }, [post])

	// Parse and reformat date
	const getDate = () => {
		const date = moment(post.timestamp).format('h:m A · MMM, D, YYYY');
		return date;
	}


	const [likeClicked, setLikeClicked] = useState(false);
	// Like popup menu click handler
	const handleLikeMenuClick = (e) => {
        e.preventDefault();
        setLikeClicked(!likeClicked);
    }

	// Set domNode to use custom hook to detect when user has clicked outside of target div
    const domNode = useClickOutside(() => {
        setLikeClicked(false);
		setRetweetClicked(false);
    });


	const { currentUser, currentUserData } = useAuth();
	

	// Batch query for users that have liked this tweet
	const [likes, setLikes] = useState([]);
	const likesIsMounted = useRef(false); // mutable flag

	useEffect(() => {
		if (!likesIsMounted.current) {
            likesIsMounted.current = true;
            return;
        }
		
		// Fetch list of users that have liked the psot
		const userRef = collection(db, 'users');
		const getLikes = async () => {
			let temp = [];
			while (post.likes.length) {
				const batch = post.likes.splice(0, 10);
				const q = query(userRef, where('__name__', 'in', batch));
	
				const querySnapshot = await getDocs(q);
				temp.push(querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id })));
			}
			setLikes(temp.flat());
		}
		getLikes();
	}, [post])


	const [retweetClicked, setRetweetClicked] = useState(false);
	// Like popup menu click handler
	const handleRetweetMenuClick = (e) => {
        e.preventDefault();
        setRetweetClicked(!retweetClicked);
    }

	// Batch query for users that have retweeted this tweet
	const [retweets, setRetweets] = useState([]);
	const retweetsIsMounted = useRef(false); // mutable flag

	useEffect(() => {
		if (!retweetsIsMounted.current) {
            retweetsIsMounted.current = true;
            return;
        }
		
		// Fetch list of users that have liked the psot
		const userRef = collection(db, 'users');
		const getRetweets = async () => {
			let temp = [];
			while (post.retweets.length) {
				const batch = post.retweets.splice(0, 10);
				const q = query(userRef, where('__name__', 'in', batch));
	
				const querySnapshot = await getDocs(q);
				temp.push(querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id })));
			}
			setRetweets(temp.flat());
		}
		getRetweets();
	}, [post])


	
	const [liked, setLiked] = useState(false);
	const handleLike = async (e) => {
		const postRef = doc(db, 'posts', post.postID);
        e.preventDefault(); // Prevent route change from happening from Link component
        await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid)
        })
    }

    const handleUnlike = async (e) => {
		const postRef = doc(db, 'posts', post.postID);
        e.preventDefault();
        await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid)
        })
    }

	const postIsMounted = useRef(false); // mutable flag
	useEffect(() => {
		if (!postIsMounted.current) {
            postIsMounted.current = true;
            return;
        }

        // Check if user has liked this post to change like button render
        const unsub = onSnapshot(doc(db, 'posts', post.postID), (doc) => {
            if (doc.data().likes.includes(currentUser.uid)) {
                setLiked(true);
            } else {
                setLiked(false);
            }
        })
        return () => {
            unsub();
        }

    }, [post])


	const [retweeted, setRetweeted] = useState(false);
	const handleRetweet = async (e) => {
        e.preventDefault();
		const postRef = doc(db, 'posts', post.postID);
		const userRef = doc(db, 'users', currentUser.uid);
        // Enter posts collection, create new doc with userID, originalID,
        // and timestamp fields
        const newPostRef = doc(collection(db, 'posts'));
        await setDoc(newPostRef, {
            userID: currentUser.uid,
            originalID: post.postID,
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
		const postRef = doc(db, 'posts', post.postID);
		const userRef = doc(db, 'users', currentUser.uid);
        // Search posts for post with field of current postID, then use the ID from that
        // to delete the corresponding field from user's post list
        const q = query(collection(db, 'posts'), where('originalID', '==', post.postID), where('userID', '==', currentUser.uid));
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

	const postRTIsMounted = useRef(false); // mutable flag
	useEffect(() => {
		if (!postRTIsMounted.current) {
            postRTIsMounted.current = true;
            return;
        }
        // Check if user has retweeted this post to change retweet button render
        const unsub = onSnapshot(doc(db, 'posts', post.postID), (doc) => {
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


	// TODO: finish this reply function

	const [replyMessage, setReplyMessage] = useState('');
	const handleReply = async (e) => {
		e.preventDefault();

		if (replyMessage === '') {
			return;
		}
	  
		// Create a new tweet using the current user data and input fields
		const newPost = await addDoc(collection(db, 'posts'), {
			replyTweetID: post.postID,
			userID: currentUser.uid,
			content: replyMessage,
			timestamp: moment().format(),  // current time with ISO 8601 format
			likes: [],
			retweets: [],
			replies: []
		});

		// Add new tweet id to author's post list
		const userRef = doc(db, 'users', currentUser.uid);
		await updateDoc(userRef, {
			posts: arrayUnion(newPost.id)
		});

		// Add new tweet id to original post's replies list
		const postRef = doc(db, 'posts', post.postID);
		await updateDoc(postRef, {
			replies: arrayUnion(newPost.id)
		});
	}


	// TODO: Batch query the replies using post.replies ID list, and set the replies state
	// as an array of objects for each reply post

	const [replies, setReplies] = useState([]);
	const repliesIsMounted = useRef(false); // mutable flag

	useEffect(() => {
		if (!repliesIsMounted.current) {
            repliesIsMounted.current = true;
            return;
        }

		const postRef = collection(db, 'posts');
		const getReplies = async () => {
			let temp = [];
			while (post.replies.length) {
				const batch = post.replies.splice(0, 10);
				const q = query(postRef, where('__name__', 'in', batch));
				const unsub = onSnapshot(q, (querySnapshot) => {

					// Upon document modification (ex: user likes post), record the modified
                    // document for later
                    const modified = [];
                    querySnapshot.docChanges().forEach((change) => {
                        if (change.type === 'modified') modified.push(
                            {   ...change.doc.data(),
                                postID: change.doc.id
                            }
                        );
                    })
                    
                    // Get list of posts for this batch
                    const replyList = querySnapshot.docs.map(doc => 
                        ({  ...doc.data(), 
                            postID: doc.id
                        })
                    )
                    
                    // If ther has been a document modification, don't concatenate list because
                    // you will end up with duplicate posts, instead find and replace old post
                    // with updated information
                    if (querySnapshot.docChanges().some(change => change.type === 'modified')) {
                        temp = temp.map(obj => modified.find(o => o.postID === obj.postID) || obj);
                    } else {
                        temp = temp.concat(replyList); 
                    }

                    setReplies(temp); 


				})
			}
		}
		getReplies();

	}, [post])

	return (
		<React.Fragment>
			<Sidebar />
			<div className='thread'>
				{ likeClicked ? 
					<div>
						<div className='thread__likeMenuBackground' />
						<div className='thread__likeMenu' ref={ domNode }>
							<div className='thread__likeMenuScrollBar'>
								<div className='profile__topper' style={{ borderRadius: 16, padding: 0  }}>
									<div className='profile__arrow'>
										<CloseIcon onClick={ handleLikeMenuClick } style={{ fontSize: 20 }} />
									</div>
									<div className='profile__topperSub'>
										<p className='profile__topperName'>Liked by</p>
									</div>
								</div>
								{ likes.map(user => (
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
						</div>
					</div>
					:
					// Create empty div with domNode ref to prevent non existent event
					// error from being thrown
					<div ref={ domNode } />
				} 
				{ retweetClicked ? 
					<div>
						<div className='thread__likeMenuBackground'>
							heh
						</div>
						<div className='thread__likeMenu' ref={ domNode }>
							<div className='thread__likeMenuScrollBar'>
								<div className='profile__topper' style={{ borderRadius: 16, padding: 0 }}>
									<div className='profile__arrow'>
										<CloseIcon onClick={ handleRetweetMenuClick } style={{ fontSize: 20 }} />
									</div>
									<div className='profile__topperSub'>
										<p className='profile__topperName'>Retweeted by</p>
									</div>
								</div>
								{ retweets.map(user => (
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
						</div>
					</div>
					:
					<div ref={ domNode } />
				}
				<div className='profile__topper'>
                    <div className='profile__arrow'>
                        <ArrowBackIcon onClick={ () => navigate(-1) } style={{ fontSize: 20 }} />
                    </div>
                    <div className='profile__topperSub'>
                        <p className='profile__topperName'>Tweet</p>
                    </div>
                </div>
				{ (post.originalID) ? 
                    <div className='thread__retweet'>
						this is a retweet
					</div>
                    :
					<div className='thread__post'>
						<Link to={ '/user/' + user.username } className='thread__heading'>
							<div className='thread__avatar'>
								<Avatar     sx={{ width: 48, height: 48, m: -1 }} 
											src={ user.image ? 
													user.image : 
													'' 
											}
								/>
							</div>
							<div className='thread__names'>
								<p className='thread__display'>{ user.displayName }</p>
								<p className='thread__username'>@{ user.username }</p>
							</div>
						</Link>
						<p className='thread__content'>{ post.content }</p>
						<p className='thread__date'>{ getDate() }</p>
						<div className='thread__stats'>
							<div className='thread__statWrapper'>
								<p onClick={ handleRetweetMenuClick } className='thread__statNumber'>
									<span style={{ fontWeight:700 }}>{ retweets.length }&nbsp;</span>
									<span style={{ color: 'var(--twitter-gray)' }}>Retweets</span>
								</p>
								<p className='thread__statNumber'>
									<span style={{ fontWeight:700 }}>{ replies.length }&nbsp;</span>
									<span style={{ color: 'var(--twitter-gray)' }}>Replies</span>
								</p>
								<p onClick={ handleLikeMenuClick } className='thread__statNumber'>
									<span style={{ fontWeight:700 }}>{ likes.length }&nbsp;</span>
									<span style={{ color: 'var(--twitter-gray)' }}>Likes</span>
								</p>
							</div>
						</div>
						<div className='thread__buttons'>
							<div className='post__replies'>
								<ChatBubbleOutlineIcon fontSize='medium' />
							</div>
							{ retweeted ?
								<div className='post__retweeted' onClick={ handleUnretweet }>
									<div className='post__retweetsIcon'>
										<RepeatIcon fontSize='medium' />
									</div>
								</div>
								:
								<div className='post__retweets' onClick={ handleRetweet }>
									<div className='post__retweetsIcon'>
										<RepeatIcon fontSize='medium' />
									</div>
								</div>
							}
							{ liked ? 
								<div className='post__liked' onClick={ handleUnlike }>
									<div className='post__likesIcon'>
										<FavoriteIcon fontSize='medium' />
									</div>
								</div>
								: 
								<div className='post__likes' onClick={ handleLike }>
									<div className='post__likesIcon'>
										<FavoriteBorderIcon fontSize='medium' />
									</div>
								</div>
							}
							<div className='post__share'>
                                <IosShareIcon fontSize='medium' />
                            </div>
						</div>
						<div className='thread__reply'>
							<p>Replying to post author</p>
							<div className='thread__avatar'>
								<Avatar     sx={{ width: 48, height: 48, m: -1 }} 
											src={ user.image ? 
													user.image : 
													'' 
											}
								/>
							</div>
							<input
								onChange={ e => setReplyMessage(e.target.value) }
								value={ replyMessage }
								placeholder='Tweet your reply' 
								type='text'
							/>
							<Button 
								className='tweetBox__tweetButton'
								type='submit'
								onClick={ handleReply }
							>
								Reply
							</Button>
						</div>
					</div>  
				}
				{ (replies.length !== 0) ? 
					replies.map(reply => (
						<Post 
							userID={ reply.userID }
							text={ reply.content }
							timestamp={ reply.timestamp }
							likes={ reply.likes }
							retweets={ reply.retweets }
							replies={ reply.replies }
							key={ reply.postID }
							id={ reply.postID }
						/>
					))
					: 
					<div>no replies</div>
				}

			</div>
			<Widgets />
		</React.Fragment>
	)
}

export default Thread