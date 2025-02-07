import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prismadb from "./prismadb";

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

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Session;
    return isAdmin(decoded) ? decoded : null;
  } catch (error) {
    console.error('[ADMIN_AUTH_ERROR]', error);
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Session;
    return isCustomer(decoded) ? decoded : null;
  } catch (error) {
    console.error('[CUSTOMER_AUTH_ERROR]', error);
    return null;
  }
}

export async function verifyAuth(): Promise<Session | null> {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return adminSession;
  }

  const customerSession = await getCustomerSession();
  return customerSession;
}

export async function getUserByEmail(email: string) {
  return prismadb.user.findUnique({
    where: { email }
  });
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prismadb.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });
}

export async function getCustomerByEmail(email: string, storeId: string) {
  return prismadb.customer.findFirst({
    where: {
      email,
      storeId
    }
  });
}

export async function createCustomer(
  email: string,
  password: string,
  storeId: string,
  name: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prismadb.customer.create({
    data: {
      email,
      password: hashedPassword,
      storeId,
      name
    }
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAdminToken(user: { id: string; email: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function generateCustomerToken(customer: { id: string; email: string; storeId: string }) {
  return jwt.sign(
    { 
      customerId: customer.id, 
      email: customer.email, 
      storeId: customer.storeId,
      role: 'customer'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );
}

export function isAdmin(session: Session | null): session is AdminSession {
  return session?.role === 'admin';
}

export function isCustomer(session: Session | null): session is CustomerSession {
  return session?.role === 'customer';
}

export function getAuthCookie(token: string, role: 'admin' | 'customer') {
  // Get domain from environment or use default
  const rootDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'lvh.me';
  // Remove port if present
  const domain = rootDomain.split(':')[0];
  
  return {
    name: role === 'admin' ? 'admin_token' : 'customer_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: domain, // This allows the cookie to work across subdomains
    expires: new Date(Date.now() + (role === 'admin' ? 7 : 30) * 24 * 60 * 60 * 1000)
  };
}
