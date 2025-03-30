import { app, InvocationContext, Timer } from '@azure/functions';

export async function auraTimerFunction(timer: Timer, context: InvocationContext): Promise<void> {
  const response = await fetch('https://aura.anth.dev/api/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    context.log('Error sending heartbeat:', response.status, response.statusText);
    throw new Error('Error sending heartbeat');
  }
  return;
}

app.timer('auraTimerFunction', {
  schedule: '0 0 10-18 * * *',
  handler: auraTimerFunction,
});