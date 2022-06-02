import React from 'react'
import './SidebarOption.css'

const SidebarOption = ({ active, text, Icon }) => {
  return (
    <div className={ `sidebarOption ${ active && 'sidebarOption--active' }` }>
      <div className='sidebarOption__oval'>
        <Icon />
        <h2>{ text }</h2>
      </div>
    </div>
  )
}

export default SidebarOption