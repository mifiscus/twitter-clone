import React from 'react'
import { Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './Auth/AuthContext'

const PrivateRoute = ({ component: Component, ...rest }) => {

    const { currentUser } = useAuth();

    return (
        currentUser ? <Outlet /> : <Navigate to='/login' />
    )
}

export default PrivateRoute