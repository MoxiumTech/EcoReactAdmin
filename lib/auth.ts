import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SignJWT, jwtVerify } from "jose";
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
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token');
    const refreshToken = cookieStore.get('customer_refresh_token');

    if (!token?.value) {
      return null;
    }

    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as Session;
      return isCustomer(decoded) ? decoded : null;
    } catch (error) {
      // If token is expired and we have a refresh token, try to refresh
      if (error instanceof jwt.TokenExpiredError && refreshToken?.value) {
        const newTokens = await refreshCustomerToken(refreshToken.value);
        if (newTokens) {
          // Set new token
          const cookieOptions = getAuthCookie(newTokens.accessToken, 'customer');
          cookieStore.set(cookieOptions.name, cookieOptions.value, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite as 'lax',
            path: cookieOptions.path,
            expires: cookieOptions.expires
          });
          
          // Decode and return new session
          const newDecoded = jwt.verify(newTokens.accessToken, process.env.JWT_SECRET!) as Session;
          return isCustomer(newDecoded) ? newDecoded : null;
        }
      }
      console.error('[CUSTOMER_AUTH_ERROR]', error);
      return null;
    }
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

export async function generateAdminToken(user: { id: string; email: string }) {
  // For server-side (Node.js) token generation
  if (process.env.RUNTIME_ENV === 'edge') {
    // Edge runtime - use jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    return new SignJWT({ userId: user.id, email: user.email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
  } else {
    // Node.js runtime - use jsonwebtoken
    return jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }
}

// Customer token generation with refresh token support
export async function generateCustomerTokens(customer: { id: string; email: string; storeId: string }) {
  const basePayload = { 
    customerId: customer.id, 
    email: customer.email, 
    storeId: customer.storeId,
    role: 'customer'
  };

  if (process.env.RUNTIME_ENV === 'edge') {
    // Edge runtime - use jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET!);

    const accessToken = await new SignJWT(basePayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(secret);

    const refreshToken = await new SignJWT({ 
      customerId: customer.id, 
      storeId: customer.storeId 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(refreshSecret);

    return { accessToken, refreshToken };
  } else {
    // Node.js runtime - use jsonwebtoken
    const accessToken = jwt.sign(
      basePayload,
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        customerId: customer.id, 
        storeId: customer.storeId 
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

// Verify refresh token and generate new access token
export async function refreshCustomerToken(refreshToken: string): Promise<{ accessToken: string } | null> {
  try {
    let decoded;
    
    if (process.env.RUNTIME_ENV === 'edge') {
      const secret = new TextEncoder().encode(process.env.REFRESH_SECRET);
      const { payload } = await jwtVerify(refreshToken, secret);
      decoded = payload;
    } else {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as jwt.JwtPayload;
    }

    const { customerId, storeId } = decoded;

    // Get customer details for new token
    const customer = await prismadb.customer.findFirst({
      where: { 
        id: customerId,
        storeId: storeId
      }
    });

    if (!customer) {
      return null;
    }

    // Generate new access token
    const { accessToken } = await generateCustomerTokens({
      id: customer.id,
      email: customer.email,
      storeId: customer.storeId
    });

    return { accessToken };
  } catch (error) {
    console.error('[REFRESH_TOKEN_ERROR]', error);
    return null;
  }
}

export function isAdmin(session: Session | null): session is AdminSession {
  return session?.role === 'admin';
}

export function isCustomer(session: Session | null): session is CustomerSession {
  return session?.role === 'customer';
}

export function getAuthCookie(token: string, role: 'admin' | 'customer', isRefreshToken: boolean = false) {
  return {
    name: role === 'admin' ? 'admin_token' : (isRefreshToken ? 'customer_refresh_token' : 'customer_token'),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(
      Date.now() + (
        role === 'admin' 
          ? 7 * 24 * 60 * 60 * 1000  // 7 days
          : (isRefreshToken 
              ? 7 * 24 * 60 * 60 * 1000  // 7 days for refresh token
              : 15 * 60 * 1000)  // 15 minutes for access token
      )
    )
  };
}
