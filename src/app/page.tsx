"use client"

import React from 'react'
import Navbar from './component/Navbar/Navbar'
import Flashsale from './component/main/Flashsale/Flashsale'
import Bestsell from './component/main/Bestsell/bestsell'

const page = () => {
  return (
    <div>
      <Navbar />
      <Flashsale />
      <Bestsell />
    </div>
  )
}

export default page
