import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './TweetBox.css'
import db from '../../firebase'
import { collection, doc, addDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { useAuth } from '../Auth/AuthContext'

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

const TweetBox = () => {
  	const [tweetMessage, setTweetMessage] = useState('');
  	const { currentUser, currentUserData } = useAuth();

  	const sendTweet = async (e) => {
		e.preventDefault();

    	if (tweetMessage === '') {
      	return;
    	}

		// Create a new tweet using the current user data and input fields
		const newPost = await addDoc(collection(db, 'posts'), {
			userID: currentUser.uid,
			content: tweetMessage,
			timestamp: moment().format(),  // current time with ISO 8601 format
			likes: [],
			retweets: [],
			replies: []
		})

		// Add the id of the new tweet into the user's database document
		const userDocument = doc(db, 'users', currentUser.uid);
		await updateDoc(userDocument, {
			posts: arrayUnion(newPost.id)
		})
		
		setTweetMessage('');
  	}
  

  	return (
		<div className='tweetBox'>
			<form>
				<div className='tweetBox__input'>
				<Avatar src={ currentUserData.image } />
				<input 
					onChange={ (e) => setTweetMessage(e.target.value) }
					value={ tweetMessage }
					placeholder='What&apos;s happening?' 
					type='text'
				/>
				</div>
				<Button 
					className='tweetBox__tweetButton'
					type='submit'
					onClick={ sendTweet }
				>
				Tweet
				</Button>
			</form>
		</div>
  	)
}

export default TweetBox