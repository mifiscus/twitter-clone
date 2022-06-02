import React, { useEffect, useState } from 'react'
import moment from 'moment';
import './Feed.css'
import TweetBox from './TweetBox'
import Post from '../Post/Post'
import Retweet from '../Retweet/Retweet'

import { useAuth } from '../Auth/AuthContext'


import useBatchQuery from '../Hooks/useBatchQuery';

const Feed = () => {
    const { currentUserData } = useAuth();

    // Fetch current user's list of users they are following
    const [followingIDs, setFollowingIDs] = useState([]);
    useEffect(() => {
        console.log('following IDs set')
        setFollowingIDs(currentUserData.following);
    }, [])


    // Fetch this profile's list of users that they are following
    const [followingList, setFollowingList] = useState([]);
    const { 
        document: followingUsers, 
        loading: userLoad, 
        error: userError 
    } = useBatchQuery('users', followingIDs);
    useEffect(() => {
        if (followingUsers !== null) {
            console.log('following list set');
            setFollowingList(followingUsers);
        }
    }, [followingUsers])

    // // Fetch this all of the posts from the users that current user is following
    const [posts, setPosts] = useState([]);
    // const followingPostIDs = followingList?.map(user => (user.posts)).flat();
    let followingPostIDs = [];
    useEffect(() => {
        followingPostIDs = followingList?.map(user => (user.posts)).flat();
        console.log(followingList?.map(user => (user.posts)).flat())
    }, [followingList])
    console.log(followingPostIDs); 
    // const {
    //     document: followingPosts, 
    //     loading: postLoad, 
    //     error: postError 
    // } = useBatchQuery('posts', followingPostIDs);
    // useEffect(() => {
    //     // Order by date
    //     const sortPosts = (temp) => {
    //         const sorted = temp.sort((a, b) => {
    //         return moment(b.timestamp).diff(a.timestamp);
    //         });
    //         return sorted;
    //     }

    //     if (followingPosts !== null) {
    //         setPosts(sortPosts(followingPosts));
    //     }
    // }, [followingPosts])
    // console.log(followingPosts);  


    // // Fetch list of posts from the users that the current user is following
    // const getFollowingPosts = async (following) => {
    //     // Fetch the IDs of all the posts every followed user has posted
    //     const followingPostIDs = following.map(user => (user.posts)).flat();

    //     const postsRef = collection(db, 'posts');
    //     let temp = [];

    //     while(followingPostIDs.length) {
    //         // Splice list of posts into batches of 10 because firebase only accepts
    //         // a maximum number of 10 values in a query filter
    //         const batch = followingPostIDs.splice(0, 10);
    //         const q = query(postsRef, where('__name__', 'in', batch));
            
    //         // Attach listeners to each batch so feed updates when users interact
    //         // with the posts
    //         const unsub = onSnapshot(q, (querySnapshot) => {

    //             // Upon document modification (ex: user likes post), record the modified
    //             // document for later
    //             const modified = [];
    //             querySnapshot.docChanges().forEach((change) => {
    //                 if (change.type === 'modified') modified.push(
    //                     {   ...change.doc.data(),
    //                         postID: change.doc.id
    //                     }
    //                 );
    //             })
                
    //             // Get list of posts for this batch
    //             const postList = querySnapshot.docs.map(doc => 
    //                 ({  ...doc.data(), 
    //                     postID: doc.id
    //                 })
    //             )
                
    //             // If ther has been a document modification, don't concatenate list because
    //             // you will end up with duplicate posts, instead find and replace old post
    //             // with updated information
    //             if (querySnapshot.docChanges().some(change => change.type === 'modified')) {
    //                 temp = temp.map(obj => modified.find(o => o.postID === obj.postID) || obj);
    //             } else {
    //                 temp = temp.concat(postList); 
    //             }

    //             setPosts(temp); 

    //         })
            
    //     }
    // }

    // if (userLoad || postLoad) {
    //     return <h1>LOADING...</h1>
    // }

    return (
        <div className='feed'>
            <div className='feed__header'>
                <h2>Home</h2>
            </div>
            <TweetBox />

            { posts.map(post => (
                (post.originalID) ? 
                    <Retweet 
                        originalID={ post.originalID }
                        userID={ post.userID }
                        timestamp={ post.timestamp }
                        key={ post.docID }
                        id={ post.docID }
                    /> 
                    :
                    <Post 
                        userID={ post.userID }
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
    )
}

export default Feed;

    // useEffect(() => {

    //     // Prevent function from running before the followingIDs state is set so the database
    //     // doesn't throw an error trying to read documents from an empty ID array
    //     if (!isMounted.current) {
    //         isMounted.current = true;
    //         return;
    //     }

    //     // Fetch list of user objects using the IDs given from current user's profile
    //     const getFollowing = async () => {
    //         const usersRef = collection(db, 'users');

    //         // Splice followingIDs into batches of 10 for the query
    //         let temp = [];
    //         while(followingIDs.length) {
    //             const batch = followingIDs.splice(0, 10);
    //             const q = query(usersRef, where('__name__', 'in', batch));

    //             const querySnapshot = await getDocs(q);
    //             // Map ID to the object so it can be accessed outside of firebase
    //             temp.push(querySnapshot.docs.map(doc => ({ ...doc.data(), userID: doc.id })));

    //         }
            
    //         // Convert map of following user data to object so you don't have to iterate over
    //         // entire array later to get user data to attach to each post, instead access user
    //         // data through the key (userID)
    //         const following = temp.flat();
            
    //         getFollowingPosts(following);
    //     }

    //     // Fetch list of posts from the users that the current user is following
    //     const getFollowingPosts = async (following) => {
    //         // Fetch the IDs of all the posts every followed user has posted
    //         const followingPostIDs = following.map(user => (user.posts)).flat();

    //         const postsRef = collection(db, 'posts');
    //         let temp = [];

    //         while(followingPostIDs.length) {
    //             // Splice list of posts into batches of 10 because firebase only accepts
    //             // a maximum number of 10 values in a query filter
    //             const batch = followingPostIDs.splice(0, 10);
    //             const q = query(postsRef, where('__name__', 'in', batch));
                
    //             // Attach listeners to each batch so feed updates when users interact
    //             // with the posts
    //             const unsub = onSnapshot(q, (querySnapshot) => {

    //                 // Upon document modification (ex: user likes post), record the modified
    //                 // document for later
    //                 const modified = [];
    //                 querySnapshot.docChanges().forEach((change) => {
    //                     if (change.type === 'modified') modified.push(
    //                         {   ...change.doc.data(),
    //                             postID: change.doc.id
    //                         }
    //                     );
    //                 })
                    
    //                 // Get list of posts for this batch
    //                 const postList = querySnapshot.docs.map(doc => 
    //                     ({  ...doc.data(), 
    //                         postID: doc.id
    //                     })
    //                 )
                    
    //                 // If ther has been a document modification, don't concatenate list because
    //                 // you will end up with duplicate posts, instead find and replace old post
    //                 // with updated information
    //                 if (querySnapshot.docChanges().some(change => change.type === 'modified')) {
    //                     temp = temp.map(obj => modified.find(o => o.postID === obj.postID) || obj);
    //                 } else {
    //                     temp = temp.concat(postList); 
    //                 }

    //                 setPosts(sortPosts(temp)); 

    //             })
                
    //         }
    //     }

    //     // Sort posts from most recent (top) to least recent (bottom)
    //     const sortPosts = (temp) => {
    //         const sorted = temp.sort((a, b) => {
    //             return moment(b.timestamp).diff(a.timestamp);
    //         });
    //         return sorted; 
    //     }


    //     getFollowing();


    // }, [followingIDs])