import React from 'react'
import { FaSearch, FaExchangeAlt, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa'

const Navbar = () => {
  return (
    <div className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-500 text-white">
      <h1 className="text-3xl italic font-bold mr-6">Favcom</h1>
      <form className="flex flex-1 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Search Products, Categories, Brands"
          className="flex-1 px-5 py-2 rounded-l-full text-gray-800 focus:outline-none"
        />
        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-r-full font-semibold border-l border-blue-800 hover:bg-blue-800">
          <FaSearch />
          Search
        </button>
      </form>
      {/* เมนูด้านขวา สามารถเพิ่มตามต้องการ */}
      <ul className="flex items-center space-x-2 ml-6">
        {/* ปุ่มเปรียบเทียบ */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaExchangeAlt size={20} />
          </button>
        </li>
        {/* ปุ่มรายการโปรด */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaHeart size={20} />
          </button>
        </li>
        {/* ปุ่มตะกร้าสินค้า */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaShoppingCart size={20} />
          </button>
        </li>
        {/* ปุ่ม Login */}
        <li>
          <button className="flex items-center gap-2 px-5 py-2 bg-blue-900 rounded-full border border-white hover:bg-blue-800">
            <FaUser size={20} />
            Login
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Navbar
