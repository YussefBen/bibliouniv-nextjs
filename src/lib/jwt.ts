import { SignJWT, jwtVerify } from 'jose';

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);


export interface TokenPayload {
  userId: string;
  role: string;
}


export async function generateAccessToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
}

export async function generateRefreshToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null; 
  }
}


export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

