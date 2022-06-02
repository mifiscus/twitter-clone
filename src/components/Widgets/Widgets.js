import React from 'react'
import './Widgets.css'

import SearchIcon from '@mui/icons-material/Search'
import { TwitterTweetEmbed } from 'react-twitter-embed'

const Widgets = () => {
  return (
    <div className='widgets'>
      <div className='widgets__input'>
        <SearchIcon className='widgets__searchIcon' />
        <input placeholder='Search Twitter' type='text' />
      </div>
      <div className='widgets__widgetContainer'>
        <h2>What's happening</h2>
        <TwitterTweetEmbed tweetId='1487516584528678912' />
      </div>
    </div>
  )
}

export default Widgets