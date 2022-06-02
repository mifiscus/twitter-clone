import React, { useEffect, useState } from 'react'
import Post from '../Post/Post'

import db from '../../firebase'
import {    doc,
            onSnapshot,
            getDoc
        } from 'firebase/firestore'

const Retweet = ({
    originalID,
    userID,
    timestamp,
    id
}) => {

    const [retweeter, setRetweeter] = useState([]);
    const [poster, setPoster] = useState([]);
    const [post, setPost] = useState([]);

    useEffect(() => {

        const getRetweeterInfo = async () => {
            const userRef = doc(db, 'users', userID);
            const userSnap = await getDoc(userRef);
            setRetweeter(userSnap.data());
        }

        // Get original post
        const unsub = onSnapshot(doc(db, 'posts', originalID), (doc) => {
            getPosterInfo(doc.data().userID);
            setPost({ ...doc.data(), postID: doc.id });
        });

        const getPosterInfo = async (posterID) => {
            const userRef = doc(db, 'users', posterID);
            const userSnap = await getDoc(userRef);
            setPoster({ ...userSnap.data(), userID: userSnap.id });
        }

        getRetweeterInfo();
        return () => {
            unsub();
        }

    }, []);

    return (
        <React.Fragment>
            { post.length === 0 || poster.length === 0 ? 
                <div /> 
                :
                <Post 
                    userID= { poster.userID }
                    text={ post.content }
                    timestamp={ post.timestamp }
                    likes={ post.likes }
                    retweets={ post.retweets }
                    replies={ post.replies }
                    key={ post.postID }
                    id={ post.postID }
                    isRetweet={ [retweeter.displayName, retweeter.username, userID] }
                />
            }
        </React.Fragment>
    )
}

export default Retweet