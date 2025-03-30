/*
// Copyright (c) 2025 Anthony Kung <hi@anth.dev> (anth.dev)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @file   auraGatewayFunctions.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 18:12 -07:00
*/

import { app, InvocationContext, output } from '@azure/functions';

const queueOutput = output.serviceBusQueue({
  queueName: 'aura-gateway-receiver',
  connection: 'ascabus_SERVICEBUS'
});

export async function auraGatewayFunctions(message: unknown, context: InvocationContext): Promise<{
  success: boolean;
  body: any;
} | void> {
  context.log('Service bus queue function processed message:', message);

  context.log('Context:', context);
  context.log('Trigger metadata:', context.triggerMetadata);

  try {
    let data: {
      op: number;
      d: any;
      t: string;
      s: number;
    } | null = null;

    // Check if the message is a string or an object
    if (typeof message === 'string') {
      try {
        data = JSON.parse(message);
      } catch (error) {
        context.error('Error parsing message:', error);
        throw new Error('Error parsing message');
      }
    }
    else if (typeof message === 'object') {
      data = message as {
        op: number;
        d: any;
        t: string;
        s: number;
      };
    }

    // Check if the message is a valid object
    if (!data || typeof data !== 'object') {
      context.error('Invalid message:', data);
      throw new Error('Invalid message');
    }

    // Conditionally handle the message based on the 'op' property
    if (data.op === 0) {  // Dispatch

      const apiURL = `https://aura.anth.dev/api/${data.t.toLowerCase().replace(/_/g, '/')}`;

      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attempts: context.triggerMetadata.deliveryCount,
          data: data,
        }),
      });

      if (!response.ok) {
        context.error('Error fetching API:', response);
        throw new Error('Error fetching API');
      }

      const responseBody = await response.json();
      context.log('API response:', responseBody);

      if (responseBody.success && responseBody.body && responseBody.body.op && responseBody.body.d) {
        // Send a message to a new queue 'aura-gateway-receiver'
        const messageToSend = {
          success: responseBody.success,
          body: {
            op: responseBody.op as number,
            d: responseBody.d,
          }
        };

        context.extraOutputs.set(queueOutput, messageToSend);
      }
      else if (!responseBody.success) {
        context.error('API response error:', responseBody);
        throw new Error('API response error');
      }
    }
  }
  catch (error) {
    context.error('Error processing message:', error);
    throw new Error('Error processing message');
  }
}

app.serviceBusQueue('auraGatewayFunctions', {
  connection: 'ascabus_SERVICEBUS',
  queueName: 'aura-gateway-sender',
  handler: auraGatewayFunctions
});
