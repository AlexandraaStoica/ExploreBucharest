import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    const svix_id = req.headers.get("svix-id")
    const svix_timestamp = req.headers.get("svix-timestamp")
    const svix_signature = req.headers.get("svix-signature")
  

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created':
      try {
        const user = evt.data;
        await db.insert(users).values({
          clerkUserId: user.id,
          username: user.username || `user_${user.id.slice(0, 8)}`,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous',
          email: user.email_addresses[0]?.email_address || '',
        });
      } catch {
        return new Response('Error creating user', { status: 500 });
      }
      break;
    case 'user.updated':
      try {
        const user = evt.data;
        await db.update(users)
          .set({
            username: user.username || `user_${user.id.slice(0, 8)}`,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous',
            email: user.email_addresses[0]?.email_address || '',
          })
          .where(eq(users.clerkUserId, user.id));
      } catch {
        return new Response('Error updating user', { status: 500 });
      }
      break;
    case 'user.deleted':
      try {
        const user = evt.data;
        await db.delete(users).where(eq(users.clerkUserId, user.id as string));
      } catch {
        return new Response('Error deleting user', { status: 500 });
      }
      break;
    default:
      // Ignore other events
      break;
  }

  return new Response('', { status: 200 });
}
