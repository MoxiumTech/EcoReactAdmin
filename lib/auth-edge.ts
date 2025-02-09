import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface AdminSession {
  userId: string;
  email: string;
  role: 'admin';
}

export interface CustomerSession {
  customerId: string;
  email: string;
  storeId: string;
  role: 'customer';
}

type Session = AdminSession | CustomerSession;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyJWT(token: string): Promise<Session> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Validate payload shape before casting
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid token payload');
    }
    
    // Check if admin token
    if (
      'userId' in payload && 
      'email' in payload && 
      payload.role === 'admin' &&
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: 'admin'
      };
    }
    
    // Check if customer token
    if (
      'customerId' in payload &&
      'email' in payload &&
      'storeId' in payload &&
      payload.role === 'customer' &&
      typeof payload.customerId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.storeId === 'string'
    ) {
      return {
        customerId: payload.customerId,
        email: payload.email,
        storeId: payload.storeId,
        role: 'customer'
      };
    }
    
    throw new Error('Invalid token payload structure');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getAdminSessionEdge(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = await verifyJWT(token);
    return isAdmin(decoded) ? decoded : null;
  } catch (error) {
    console.error('[ADMIN_AUTH_ERROR]', error);
    return null;
  }
}

export async function getCustomerSessionEdge(): Promise<CustomerSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = await verifyJWT(token);
    return isCustomer(decoded) ? decoded : null;
  } catch (error) {
    console.error('[CUSTOMER_AUTH_ERROR]', error);
    return null;
  }
}

export function isAdmin(session: Session | null): session is AdminSession {
  return session?.role === 'admin';
}

export function isCustomer(session: Session | null): session is CustomerSession {
  return session?.role === 'customer';
}
