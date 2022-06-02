import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import SidebarOption from './SidebarOption';
import { Link } from 'react-router-dom'
import { useAuth } from '../Auth/AuthContext'

import Avatar from '@mui/material/Avatar';
import TwitterIcon from '@mui/icons-material/Twitter';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TagIcon from '@mui/icons-material/Tag';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { useNavigate } from 'react-router-dom'
import { doc, deleteDoc } from "firebase/firestore";
import db from '../../firebase'

import Button from '@mui/material/Button';

import useFetchListen from '../Hooks/useFetchListen'

const Sidebar = () => {

	const { currentUser, getUserData, logout, deleteAccount } = useAuth();
	const [user, setUser] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

  	const userUrl = '/user/' + user.username;

	useEffect(() => {
		const fetchData = async () => {
		try {
			setError('');
			setUser(await getUserData(currentUser));
		} catch(error) {
			setError('Failed to obtain user data');
				console.log(error);
		}
		}
		fetchData()
	}, [])

	const handleLogout = async () => {
		setError('');

		try {
		navigate('/login');
		await logout()
		} catch(error) {
		setError('Failed to log out');
		console.log(error);
		}
	}

	const handleDelete = async () => {
		setError('');

		try {
		navigate('/signup');
		await deleteAccount()
		deleteDoc(doc(db, 'users', currentUser.uid));
		} catch(error) {
		setError('Failed to delete user');
		console.log(error);
		}
	}

	// const { document, loading, err } = useFetchListen('users', '__name__', currentUser.uid);
	// if (loading) return <h1>LOADING...</h1>;
	// if (err) console.log(error);

	return (
		<div className='sidebar'>
		
		<TwitterIcon className='sidebar__twitterIcon'/>

		<Link to='/home' style={{ textDecoration: 'none' }}>
			<SidebarOption active Icon={ HomeOutlinedIcon } text='Home'/>
		</Link>
		<SidebarOption Icon={ TagIcon } text='Explore'/>
		<SidebarOption Icon={ NotificationsNoneIcon } text='Notifications'/>
		<SidebarOption Icon={ MailOutlineIcon } text='Messages'/>
		<SidebarOption Icon={ BookmarkBorderIcon } text='Bookmarks'/>
		<SidebarOption Icon={ ListAltIcon } text='List'/>
		<Link to={ userUrl } style={{ textDecoration: 'none' }}>
			<SidebarOption Icon={ PersonOutlineIcon } text='Profile'/>
		</Link>
		<SidebarOption Icon={ MoreHorizIcon } text='More'/>
		
		<Button variant='outlined' className='sidebar__tweet' fullWidth>Tweet</Button>
		<button onClick={ handleLogout }>Log Out</button>
		<button onClick={ handleDelete }>Delete Account</button>
		<Link className='sidebar__profileLink' to={ userUrl }>
			<div className='sidebar__profile'>
				<Avatar    className='sidebar__image' 
										src={ user.image ? 
											user.image 
											: 
											'' 
										} 
				/>
				<div className='sidebar__profileName'>
				<p className='sidebar__profileDisplayName'>{ user.displayName }</p>
				<p className='sidebar__profileUsername'>@{ user.username }</p>
				</div>
				<MoreHorizIcon className='sidebar__profileMore' />
			</div>
		</Link>
		<Link to='/users'>Users</Link>
		{/* <div>{ document?.displayName } : { document?.username }</div> */}
		</div> 
  	)
}

export default Sidebar;