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
        const limit = searchParams.get('limit') || '10';

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

        const response = await fetch(`${API_URL}/coins/topup-requests?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error fetching topup requests:', error);
        return NextResponse.json(
            { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message },
            { status: 500 }
        );
    }
}
