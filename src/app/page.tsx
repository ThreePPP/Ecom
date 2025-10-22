"use client"

import React from 'react'
import Navbar from './component/Navbar/Navbar'
import Flashsale from './component/main/Flashsale/Flashsale'
import Bestsell from './component/main/Bestsell/bestsell'
import Footer from './component/main/footer/footer'
import AllCategory from './component/main/Allcategory/allcategory'

const page = () => {
  return (
    <div>
      <Navbar />
      <Flashsale />
      <Bestsell />
      <AllCategory />
      <Footer />
    </div>
  )
}

export default page
