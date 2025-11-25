"use client"

import React, { useState, useRef, useEffect } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaDesktop, FaQuestionCircle, FaShoppingCart } from 'react-icons/fa'
import axios from 'axios'

interface PCSpecs {
  cpu: string
  motherboard: string
  cpuCooler: string
  ram: string
  gpu: string
  psu: string
}

interface QuickOption {
  id: string
  label: string
  icon: React.ReactNode
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isBot: boolean; options?: QuickOption[] }[]>([
    { 
      text: 'สวัสดีครับ! ผมเป็น AI ผู้ช่วยบริการลูกค้า มีอะไรให้ช่วยไหมครับ?', 
      isBot: true,
      options: [
        { id: 'upgrade', label: '🖥️ อัพเกรด/เปลี่ยนชิ้นส่วน PC', icon: <FaDesktop /> },
        { id: 'order', label: '🛒 สอบถามการสั่งซื้อ', icon: <FaShoppingCart /> },
        { id: 'other', label: '❓ สอบถามอื่นๆ', icon: <FaQuestionCircle /> }
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'normal' | 'upgrade-collect' | 'upgrade-select' | 'upgrade-analyze'>('normal')
  const [pcSpecs, setPcSpecs] = useState<PCSpecs>({
    cpu: '',
    motherboard: '',
    cpuCooler: '',
    ram: '',
    gpu: '',
    psu: ''
  })
  const [selectedComponent, setSelectedComponent] = useState<string>('')
  const [currentSpecStep, setCurrentSpecStep] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle quick option selection
  const handleQuickOption = async (optionId: string) => {
    if (optionId === 'upgrade') {
      setChatMode('upgrade-collect')
      setCurrentSpecStep(1)
      setPcSpecs({
        cpu: '',
        motherboard: '',
        cpuCooler: '',
        ram: '',
        gpu: '',
        psu: ''
      })
      setMessages(prev => [
        ...prev,
        { text: '🖥️ อัพเกรด/เปลี่ยนชิ้นส่วน PC', isBot: false },
        { 
          text: 'เยี่ยมเลยครับ! 💻 ผมจะช่วยวิเคราะห์สเปค PC ของคุณ\n\nมาเริ่มกันเลยครับ!\n\n1️⃣ CPU: กรุณาพิมพ์ชื่อรุ่น CPU ของคุณ\n(เช่น Intel i5-12400F, AMD Ryzen 5 5600X)',
          isBot: true 
        }
      ])
    } else if (optionId === 'order') {
      setMessages(prev => [
        ...prev,
        { text: '🛒 สอบถามการสั่งซื้อ', isBot: false },
        { text: 'ยินดีช่วยเหลือเรื่องการสั่งซื้อครับ! คุณต้องการสอบถามเรื่องอะไรครับ? เช่น สถานะออเดอร์ การชำระเงิน การจัดส่ง หรือการคืนสินค้า', isBot: true }
      ])
    } else {
      setMessages(prev => [
        ...prev,
        { text: '❓ สอบถามอื่นๆ', isBot: false },
        { text: 'ได้เลยครับ! มีอะไรให้ช่วยไหมครับ? สามารถพิมพ์คำถามได้เลยครับ', isBot: true }
      ])
    }
  }

  // Spec collection steps configuration
  const specSteps = [
    { key: 'cpu' as keyof PCSpecs, name: 'CPU', example: 'Intel i5-12400F, AMD Ryzen 5 5600X' },
    { key: 'motherboard' as keyof PCSpecs, name: 'Motherboard', example: 'MSI B660M Pro, ASUS TUF B550' },
    { key: 'cpuCooler' as keyof PCSpecs, name: 'CPU Cooler', example: 'Stock Cooler, ID-Cooling SE-214-XT' },
    { key: 'ram' as keyof PCSpecs, name: 'RAM', example: '16GB DDR4 3200MHz, 32GB DDR5 6000MHz' },
    { key: 'gpu' as keyof PCSpecs, name: 'GPU (การ์ดจอ)', example: 'RTX 3060, RTX 4060 Ti, RX 6700 XT' },
    { key: 'psu' as keyof PCSpecs, name: 'PSU (Power Supply)', example: '550W, 650W 80+ Bronze' }
  ]

  // Generate next step message
  const getNextStepMessage = (step: number): string => {
    if (step > specSteps.length) return ''
    const stepInfo = specSteps[step - 1]
    return `${step}️⃣ ${stepInfo.name}: กรุณาพิมพ์ชื่อรุ่น\n(เช่น ${stepInfo.example})`
  }

  // Parse PC specs from user input (for fallback)
  const parsePCSpecs = (text: string): PCSpecs | null => {
    const specs: PCSpecs = {
      cpu: '',
      motherboard: '',
      cpuCooler: '',
      ram: '',
      gpu: '',
      psu: ''
    }

    const lines = text.split('\n')
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('cpu:') && !lowerLine.includes('cooler')) {
        specs.cpu = line.split(':')[1]?.trim() || ''
      } else if (lowerLine.includes('motherboard:') || lowerLine.includes('mb:')) {
        specs.motherboard = line.split(':')[1]?.trim() || ''
      } else if (lowerLine.includes('cooler:')) {
        specs.cpuCooler = line.split(':')[1]?.trim() || ''
      } else if (lowerLine.includes('ram:')) {
        specs.ram = line.split(':')[1]?.trim() || ''
      } else if (lowerLine.includes('gpu:') || lowerLine.includes('การ์ดจอ:') || lowerLine.includes('vga:')) {
        specs.gpu = line.split(':')[1]?.trim() || ''
      } else if (lowerLine.includes('psu:') || lowerLine.includes('power:')) {
        specs.psu = line.split(':')[1]?.trim() || ''
      }
    }

    // Check if at least some specs are provided
    if (specs.cpu || specs.gpu || specs.ram) {
      return specs
    }
    return null
  }

  // Generate specs list message
  const generateSpecsList = (specs: PCSpecs): string => {
    return `📋 สเปค PC ของคุณ:\n\n1️⃣ CPU: ${specs.cpu || 'ไม่ระบุ'}\n2️⃣ Motherboard: ${specs.motherboard || 'ไม่ระบุ'}\n3️⃣ CPU Cooler: ${specs.cpuCooler || 'ไม่ระบุ'}\n4️⃣ RAM: ${specs.ram || 'ไม่ระบุ'}\n5️⃣ GPU: ${specs.gpu || 'ไม่ระบุ'}\n6️⃣ PSU: ${specs.psu || 'ไม่ระบุ'}\n\n🔧 ต้องการเปลี่ยนชิ้นไหน?\nกรุณาพิมพ์เลขและชื่อรุ่นใหม่\n(เช่น "5 RTX 4060 Ti" หมายถึงเปลี่ยน GPU เป็น RTX 4060 Ti)`
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() === '' || isLoading) return

    const userMessage = inputMessage.trim()
    
    // Add user message
    const newMessages = [...messages, { text: userMessage, isBot: false }]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      // Handle different chat modes
      if (chatMode === 'upgrade-collect') {
        // Step-by-step spec collection
        const currentStep = specSteps[currentSpecStep - 1]
        
        if (currentStep) {
          // Save current spec
          const updatedSpecs = { ...pcSpecs, [currentStep.key]: userMessage }
          setPcSpecs(updatedSpecs)
          
          if (currentSpecStep < specSteps.length) {
            // Move to next step
            const nextStep = currentSpecStep + 1
            setCurrentSpecStep(nextStep)
            setMessages([...newMessages, {
              text: `✅ บันทึก ${currentStep.name}: ${userMessage}\n\n${getNextStepMessage(nextStep)}`,
              isBot: true
            }])
          } else {
            // All specs collected, show summary
            setChatMode('upgrade-select')
            setCurrentSpecStep(0)
            setMessages([...newMessages, {
              text: `✅ บันทึก ${currentStep.name}: ${userMessage}\n\n${generateSpecsList(updatedSpecs)}`,
              isBot: true
            }])
          }
          setIsLoading(false)
          return
        }
      } else if (chatMode === 'upgrade-select') {
        // User selecting component to upgrade with new value in one message
        // Format: "5 RTX 4060 Ti" or "5" alone
        const componentMap: { [key: string]: keyof PCSpecs } = {
          '1': 'cpu',
          '2': 'motherboard', 
          '3': 'cpuCooler',
          '4': 'ram',
          '5': 'gpu',
          '6': 'psu'
        }
        const componentNames: { [key: string]: string } = {
          'cpu': 'CPU',
          'motherboard': 'Motherboard',
          'cpuCooler': 'CPU Cooler',
          'ram': 'RAM',
          'gpu': 'การ์ดจอ (GPU)',
          'psu': 'Power Supply'
        }

        // Parse input: "5 RTX 4060 Ti" -> componentNum = "5", newValue = "RTX 4060 Ti"
        const match = userMessage.match(/^(\d)\s*(.*)$/)
        
        if (match) {
          const componentNum = match[1]
          const newValue = match[2].trim()
          const selectedKey = componentMap[componentNum]
          
          if (selectedKey) {
            if (newValue) {
              // User provided both number and new value - proceed to analyze
              setSelectedComponent(selectedKey)
              setChatMode('upgrade-analyze')
              
              // Store original specs before updating
              const originalSpecs = { ...pcSpecs }
              
              // Update specs with new component
              const updatedSpecs = { ...pcSpecs, [selectedKey]: newValue }
              setPcSpecs(updatedSpecs)

              // Call Gemini API for analysis - send ORIGINAL specs so API can show "from X to Y"
              const response = await axios.post('/api/chat', {
                message: userMessage,
                history: messages.slice(-10).map(m => ({ text: m.text, isBot: m.isBot })),
                mode: 'pc-upgrade',
                pcSpecs: originalSpecs,
                upgradedComponent: selectedKey,
                newComponentValue: newValue
              })

              const data = response.data
              
              if (data.response) {
                setChatMode('normal')
                setMessages([...newMessages, {
                  text: data.response,
                  isBot: true,
                  options: [
                    { id: 'upgrade', label: '🔄 วิเคราะห์ชิ้นส่วนอื่น', icon: <FaDesktop /> },
                    { id: 'other', label: '❓ สอบถามเพิ่มเติม', icon: <FaQuestionCircle /> }
                  ]
                }])
              } else {
                setMessages([...newMessages, {
                  text: 'ขออภัยครับ ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
                  isBot: true
                }])
              }
              setIsLoading(false)
              return
            } else {
              // User provided only number - ask for new value
              setSelectedComponent(selectedKey)
              setChatMode('upgrade-analyze')
              setMessages([...newMessages, {
                text: `คุณเลือกเปลี่ยน ${componentNames[selectedKey]} ครับ\n\n🎯 กรุณาพิมพ์รุ่นใหม่ที่ต้องการเปลี่ยนไป:\n(เช่น RTX 4060 Ti, Intel i7-13700K, DDR5 32GB 6000MHz)`,
                isBot: true
              }])
              setIsLoading(false)
              return
            }
          }
        }
        
        setMessages([...newMessages, {
          text: 'กรุณาพิมพ์เลข 1-6 ตามด้วยชื่อรุ่นใหม่\n(เช่น "5 RTX 4060 Ti" หมายถึงเปลี่ยน GPU เป็น RTX 4060 Ti)\n\nหรือพิมพ์แค่เลขก็ได้ครับ แล้วค่อยบอกรุ่นทีหลัง',
          isBot: true
        }])
        setIsLoading(false)
        return
      } else if (chatMode === 'upgrade-analyze') {
        // User specified new component, analyze with Gemini
        const newComponent = userMessage
        const componentNames: { [key: string]: string } = {
          'cpu': 'CPU',
          'motherboard': 'Motherboard', 
          'cpuCooler': 'CPU Cooler',
          'ram': 'RAM',
          'gpu': 'การ์ดจอ (GPU)',
          'psu': 'Power Supply'
        }

        // Store original specs before updating
        const originalSpecs = { ...pcSpecs }
        
        // Update specs with new component
        const updatedSpecs = { ...pcSpecs, [selectedComponent]: newComponent }
        setPcSpecs(updatedSpecs)

        // Call Gemini API for analysis - send ORIGINAL specs so API can show "from X to Y"
        const response = await axios.post('/api/chat', {
          message: userMessage,
          history: messages.slice(-10).map(m => ({ text: m.text, isBot: m.isBot })),
          mode: 'pc-upgrade',
          pcSpecs: originalSpecs,
          upgradedComponent: selectedComponent,
          newComponentValue: newComponent
        })

        const data = response.data
        
        if (data.response) {
          setChatMode('normal')
          setMessages([...newMessages, {
            text: data.response,
            isBot: true,
            options: [
              { id: 'upgrade', label: '🔄 วิเคราะห์ชิ้นส่วนอื่น', icon: <FaDesktop /> },
              { id: 'other', label: '❓ สอบถามเพิ่มเติม', icon: <FaQuestionCircle /> }
            ]
          }])
        } else {
          setMessages([...newMessages, {
            text: 'ขออภัยครับ ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            isBot: true
          }])
        }
        setIsLoading(false)
        return
      }

      // Normal chat mode - Call Gemini API
      const response = await axios.post('/api/chat', {
        message: userMessage,
        history: messages.slice(-10).map(m => ({ text: m.text, isBot: m.isBot }))
      })

      const data = response.data

      if (data.response) {
        setMessages([...newMessages, { 
          text: data.response, 
          isBot: true 
        }])
      } else {
        setMessages([...newMessages, { 
          text: 'ขออภัยครับ ระบบขัดข้อง กรุณาลองใหม่อีกครั้งหรือติดต่อฝ่ายบริการลูกค้า', 
          isBot: true 
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, { 
        text: 'ขออภัยครับ ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง', 
        isBot: true 
      }])
    } finally {
      setIsLoading(false)
    }
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
                <h3 className="font-semibold">Ai chatbot ศูนย์ช่วยเหลือลูกค้า</h3>
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
              <div key={index} className="space-y-2">
                <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-lg ${
                      message.isBot
                        ? 'bg-white text-gray-800 border border-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
                {/* Quick Options */}
                {message.isBot && message.options && (
                  <div className="flex flex-col gap-2 ml-2">
                    {message.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleQuickOption(option.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200 text-left"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
