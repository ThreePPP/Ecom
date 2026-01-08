"use client"

import React from 'react'
import Navbar from './component/Navbar/Navbar'
import Flashsale from './component/main/Flashsale/Flashsale'
import Bestsell from './component/main/Bestsell/bestsell'
import Footer from './component/main/footer/footer'
import AllCategory from './component/main/Allcategory/allcategory'
import Features from './component/main/Features/Features'
import PromoBanners from './component/main/PromoBanners/PromoBanners'

const page = () => {
  return (
    <div>
      <Navbar />
      <div id="promotions">
        <PromoBanners />
      </div>
      <div id="flashsale">
        <Flashsale />
      </div>
      <div id="bestsell">
        <Bestsell />
      </div>
      <div id="allcategory">
        <AllCategory />
      </div>
      <Features />
      <Footer />
    </div>
  )
}

export default page
