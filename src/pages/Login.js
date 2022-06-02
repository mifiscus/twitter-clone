import React, { useRef, useState } from 'react'
import { useAuth } from '../components/Auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'


import Button from '@mui/material/Button';

const Login = () => {

    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e  => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/home');
        } catch(error) {
            setError('Failed to sign in');
            console.log(error);
            setLoading(false);  // THIS COULD BE A PROBLEM
        }
    }

  return (
    <div>
        <h2>Log In</h2>
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
                password
                <input 
                    id='password'
                    ref={ passwordRef } 
                    type='password'
                    required
                />
            </div>
            <Button 
              className='login__button'
              type='submit'
              disabled={ loading }
            >
              Log In
            </Button>
        </form>
        <div className='forgot_password'>
            <Link to='/forgot-password'>Forgot Password?</Link>
        </div>
        <Link to='/signup'>Sign up!</Link>
    </div>
  )
}

export default Login