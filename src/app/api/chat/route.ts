import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface PCSpecs {
  cpu: string
  motherboard: string
  cpuCooler: string
  ram: string
  gpu: string
  psu: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, mode, pcSpecs, upgradedComponent, newComponentValue } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Get the Gemini Pro model with configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })

    let systemPrompt: string
    let fullPrompt: string

    if (mode === 'pc-upgrade' && pcSpecs && upgradedComponent && newComponentValue) {
      // PC Upgrade Analysis Mode
      const specs = pcSpecs as PCSpecs
      const componentNames: { [key: string]: string } = {
        'cpu': 'CPU',
        'motherboard': 'Motherboard',
        'cpuCooler': 'CPU Cooler',
        'ram': 'RAM',
        'gpu': 'การ์ดจอ (GPU)',
        'psu': 'Power Supply'
      }

      systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านคอมพิวเตอร์และเกมมิ่ง มีความรู้ลึกซึ้งเกี่ยวกับฮาร์ดแวร์ PC ทุกชนิด

เมื่อผู้ใช้ถามเกี่ยวกับการอัพเกรด PC ให้วิเคราะห์และตอบในรูปแบบดังนี้:

1. 📊 สรุปสเปคใหม่หลังอัพเกรด (แสดงเป็นรายการ)
2. ✅ ความเข้ากันได้ของชิ้นส่วน (เช่น bottleneck, พอร์ต, กำลังไฟ)
3. 🎮 ประสิทธิภาพในการเล่นเกม:
   - เกมยอดนิยม 5-7 เกม พร้อมประมาณ FPS ที่ 1080p และ 1440p (High/Ultra settings)
   - เช่น Cyberpunk 2077, GTA V, Valorant, CS2, Fortnite, Call of Duty, Elden Ring
4. 💼 ประสิทธิภาพในการทำงาน:
   - Video Editing (Premiere Pro, DaVinci)
   - 3D Rendering (Blender, Cinema 4D)
   - Streaming
   - Programming/Development
5. 💡 คำแนะนำเพิ่มเติม (ถ้ามี)

ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย ใช้ emoji ให้เหมาะสม`

      fullPrompt = `${systemPrompt}

สเปค PC ปัจจุบันของลูกค้า:
- CPU: ${specs.cpu}
- Motherboard: ${specs.motherboard}
- CPU Cooler: ${specs.cpuCooler}
- RAM: ${specs.ram}
- GPU: ${specs.gpu}
- PSU: ${specs.psu}

ลูกค้าต้องการเปลี่ยน ${componentNames[upgradedComponent]}: จาก "${specs[upgradedComponent as keyof PCSpecs]}" เป็น "${newComponentValue}"

กรุณาวิเคราะห์การอัพเกรดนี้:`
    } else {
      // Normal E-commerce Support Mode
      systemPrompt = `คุณเป็น AI ผู้ช่วยบริการลูกค้าของร้านค้าออนไลน์ขายอุปกรณ์คอมพิวเตอร์และเกมมิ่ง มีหน้าที่ช่วยเหลือลูกค้าเกี่ยวกับ:
- การสั่งซื้อสินค้า
- การชำระเงิน
- การจัดส่งสินค้า
- การคืนสินค้าและการรับประกัน
- ข้อมูลสินค้าทั่วไป เช่น GPU, CPU, RAM, Motherboard
- โปรโมชั่นและส่วนลด
- คำแนะนำในการเลือกซื้ออุปกรณ์คอมพิวเตอร์

กรุณาตอบเป็นภาษาไทยอย่างสุภาพและเป็นมิตร ตอบให้กระชับและเข้าใจง่าย
หากไม่ทราบข้อมูลให้แนะนำให้ติดต่อฝ่ายบริการลูกค้าโดยตรง`

      // Build conversation history for context
      const conversationHistory = history
        ?.map((msg: { text: string; isBot: boolean }) => 
          `${msg.isBot ? 'ผู้ช่วย' : 'ลูกค้า'}: ${msg.text}`
        )
        .join('\n') || ''

      fullPrompt = `${systemPrompt}

${conversationHistory ? `บทสนทนาก่อนหน้า:\n${conversationHistory}\n` : ''}
ลูกค้า: ${message}
ผู้ช่วย:`
    }

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error('Gemini API error:', error)
    console.error('Error details:', error?.message || error)
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
