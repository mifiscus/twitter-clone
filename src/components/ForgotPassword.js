import React, { useRef, useState } from 'react'
import { useAuth } from '../components/Auth/AuthContext'
import { Link } from 'react-router-dom'


import Button from '@mui/material/Button';

const ForgotPassword = () => {

    const emailRef = useRef();
    const { resetPassword } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e  => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage('Check your inbox for further instructions');
            setLoading(false);
        } catch(error) {
            setError('Failed to reset password');
            console.log(error);
            setLoading(false);  // THIS COULD BE A PROBLEM
        }
    }

  return (
    <div>
        <h2>Reset Password</h2>
        {error && <h1 className='danger'>{ error }</h1> }
        {message && <h1 className='success'>{ message }</h1> }
        <form onSubmit={ handleSubmit }>
            <div>
                email
                <input
                    id='email' 
                    ref={ emailRef } 
                    type='email'
                    required
                />
            </div>
            <Button 
              className='login__button'
              type='submit'
              disabled={ loading }
            >
              Reset Password
            </Button>
        </form>
        <div className='login'>
            <Link to='/login'>Login</Link>
        </div>
    </div>
  )
}

export default ForgotPassword