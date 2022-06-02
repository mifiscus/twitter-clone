import React from 'react'

import Sidebar from '../components/Sidebar/Sidebar'
import Feed from '../components/Feed/Feed'
import Widgets from '../components/Widgets/Widgets'

const Home = () => {

  return (
    <React.Fragment>
        <Sidebar />
        <Feed />
        <Widgets />
    </React.Fragment>
  )
}

export default Home