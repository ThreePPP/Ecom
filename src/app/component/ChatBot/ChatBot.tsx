"use client"

import React, { useState } from 'react'
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa'

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?', isBot: true }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() === '') return

    // Add user message
    const newMessages = [...messages, { text: inputMessage, isBot: false }]
    setMessages(newMessages)
    setInputMessage('')

    // Simulate bot response
    setTimeout(() => {
      setMessages([...newMessages, { 
        text: 'ขอบคุณที่ติดต่อเรา ทีมงานจะตอบกลับโดยเร็วที่สุดครับ', 
        isBot: true 
      }])
    }, 1000)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <FaComments className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold">ช่วยเหลือลูกค้า</h3>
                <p className="text-xs text-blue-100">ออนไลน์</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-2 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors"
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <>
            <FaComments size={28} className="group-hover:scale-110 transition-transform duration-300" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}
      </button>

      {/* Pulse Animation */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 animate-ping opacity-20 z-40"></div>
      )}
    </>
  )
}

export default ChatBot
