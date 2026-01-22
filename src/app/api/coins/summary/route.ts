import { NextRequest, NextResponse } from 'next/server';

// Use BACKEND_API_URL for server-side calls (not NEXT_PUBLIC_API_URL which may be relative)
const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!API_URL || API_URL.startsWith('/')) {
  console.error("BACKEND_API_URL must be set to an absolute URL for server-side API routes.");
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    console.log('📥 [Proxy] Received auth header:', authHeader ? (authHeader.substring(0, 20) + '...') : 'NULL');

    // We removed the strict check here to let backend handle 401 response appropriately
    
    // Prepare headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const backendUrl = `${API_URL}/coins/summary`;
    console.log(`🔌 [Proxy] Connecting to backend: ${backendUrl}`);

    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers,
      });

      console.log(`✅ [Proxy] Backend response status: ${response.status}`);
      
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError: any) {
      console.error('❌ [Proxy] Failed to fetch from backend:', fetchError);
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถเชื่อมต่อกับ Backend Server ได้', error: fetchError.message, backendUrl },
        { status: 502 } // Bad Gateway
      );
    }
  } catch (error: any) {
    console.error('🔥 [Proxy] Internal Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดภายใน Proxy', error: error.message },
      { status: 500 }
    );
  }
}
