'use server';

import { z } from 'zod';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signIn } from '@/auth';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/dal';
import { updateUserName } from '@/lib/data-access/users';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { buildVerificationHtml } from '@/lib/email-verification';
import { enqueueEmail } from '@/lib/email-queue';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email').trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .trim(),
});

const LoginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1),
});

async function getUserForValidCredentials(email: string, password: string) {
  const [user] = await db
    .select({
      role: users.role,
      hashedPassword: users.hashedPassword,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.hashedPassword) return null;

  const isValid = await compare(password, user.hashedPassword);
  return isValid ? user : null;
}

export type SignupState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function signup(prevState: SignupState, formData: FormData) {
  const validated = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validated.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    return {
      message: 'An account with this email already exists',
    };
  }

  const hashedPassword = await hash(password, 12);
  const verificationToken = randomUUID();
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await db.insert(users).values({
      name,
      email,
      hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    const verificationUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')}/api/verify-email?token=${encodeURIComponent(verificationToken)}`;
    await enqueueEmail({
      to: email,
      subject: 'Verify your email — Glamour Beauty',
      html: buildVerificationHtml(name, verificationUrl),
    });
  } catch {
    return {
      message: 'Something went wrong. Please try again.',
    };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export type LoginState =
  | {
      message?: string;
    }
  | undefined;

export async function login(prevState: LoginState, formData: FormData) {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { message: 'Invalid email or password' };
  }

  const { email, password } = validated.data;

  const user = await getUserForValidCredentials(email, password);
  if (!user) {
    return { message: 'Invalid email or password' };
  }

  if (!user.emailVerified && user.role !== 'admin') {
    return { message: 'Please verify your email first' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { message: 'Invalid email or password' };
    }
    return { message: 'Something went wrong. Please try again.' };
  }

  const callbackUrl = formData.get('callbackUrl') as string | null;
  const redirectTo = callbackUrl || (user.role === 'admin' ? '/admin' : '/');
  redirect(redirectTo);
}

export type ResendState =
  | {
      message?: string;
      success?: string;
    }
  | undefined;

export async function resendVerification(prevState: ResendState, formData: FormData) {
  const email = formData.get('email') as string | null;

  if (!email) {
    return { message: 'Please enter your email address' };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return {
      success: 'If an account exists with this email, a new verification link has been sent.',
    };
  }

  if (user.emailVerified) {
    return { success: 'This email is already verified. You can sign in.' };
  }

  const verificationToken = randomUUID();
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({ verificationToken, verificationTokenExpiresAt })
    .where(eq(users.id, user.id));

  const verificationUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')}/api/verify-email?token=${encodeURIComponent(verificationToken)}`;
  await enqueueEmail({
    to: email,
    subject: 'Verify your email — Glamour Beauty',
    html: buildVerificationHtml(user.name, verificationUrl),
  });

  return {
    success: 'If an account exists with this email, a new verification link has been sent.',
  };
}

export async function updateAccountName(name: string) {
  const { userId } = await verifySession();

  const parsed = z.string().min(2, 'Name must be at least 2 characters').trim().safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(', ') };
  }

  await updateUserName(userId, parsed.data);
}
