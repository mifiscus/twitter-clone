import React, { useRef, useState } from 'react'
import { useAuth } from '../components/Auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from "firebase/firestore"
import db from '../firebase'


import Button from '@mui/material/Button';

const Signup = () => {

    const emailRef = useRef();
    const nameRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e  => {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }
        if (passwordRef.current.value.length < 6) {
            return setError('Passwords must be at least 6 characters');
        }
        if (!usernameRef.current.value.match(/^[0-9a-zA-Z]+$/)) {
            return setError('Username contains an invalid character')
        }

        try {
            setError('');
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value)
                .then((userCredential) => {
                    const userUID = userCredential.user.uid;
                    const userEmail = userCredential.user.email;

                    // Create new user document in database
                    setDoc(doc(db, 'users', userUID), {
                        displayName: nameRef.current.value,
                        username: usernameRef.current.value,
                        email: userEmail,
                        bio: '',
                        image: '',
                        following: [],
                        followers: [],
                        posts: []
                    });
                })
            navigate('/home');
        } catch(error) {
            setError('Failed to create an account');
            console.log(error);
            setLoading(false);  //  THIS COULD BE A PROBLEM
        }
        
    }

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <h1 className='danger'>{ error }</h1> }
            <form onSubmit={ handleSubmit }>
                <div>
                    email
                    <input
                        id='email' 
                        ref={ emailRef } 
                        type='email'
                        required
                    />
                    name
                    <input
                        id='displayName' 
                        ref={ nameRef } 
                        type='text'
                        required
                    />
                    username
                    <input
                        id='username' 
                        ref={ usernameRef } 
                        type='text'
                        required
                    />
                    password
                    <input 
                        id='password'
                        ref={ passwordRef } 
                        type='password'
                        required
                    />
                    confirm password
                    <input 
                        id='passwordConfirm'
                        ref={ passwordConfirmRef } 
                        type='password'
                        required
                    />
                </div>
                <Button 
                className='signup__button'
                type='submit'
                disabled={ loading }
                >
                Sign Up
                </Button>
            </form>
        </div>
    )
}

export default Signup