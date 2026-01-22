import { NextRequest, NextResponse } from 'next/server';

// Use BACKEND_API_URL for server-side calls (not NEXT_PUBLIC_API_URL which may be relative)
const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!API_URL || API_URL.startsWith('/')) {
  console.error("BACKEND_API_URL must be set to an absolute URL for server-side API routes.");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');

    // We removed the strict check here to let backend handle 401 response appropriately
    
    // Prepare headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const backendUrl = `${API_URL}/coins/transactions?page=${page}&limit=${limit}`;
    console.log(`🔌 [Proxy] Connecting to backend: ${backendUrl}`);

    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
        });

        console.log(`✅ [Proxy] Backend status: ${response.status}`);

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ [Proxy] Backend returned non-JSON:', text.substring(0, 100));
            return NextResponse.json(
                { success: false, message: 'Backend returned invalid format', error: text.substring(0, 100) },
                { status: 502 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (fetchError: any) {
        console.error('❌ [Proxy] Fetch error:', fetchError);
        return NextResponse.json(
            { success: false, message: 'Failed to connect to backend', error: fetchError.message },
            { status: 502 }
        );
    }
  } catch (error: any) {
    console.error('🔥 [Proxy] Internal Error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy internal error', error: error.message },
      { status: 500 }
    );
  }
}
