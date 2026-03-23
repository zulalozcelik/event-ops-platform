import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

export const EVENT_CAPACITY_UPDATED_EVENT = 'event.capacity.updated';
export const EVENT_CAPACITY_SUBSCRIBE_EVENT = 'event.capacity.subscribe';
export const EVENT_CAPACITY_UNSUBSCRIBE_EVENT = 'event.capacity.unsubscribe';

interface EventCapacitySubscriptionPayload {
  eventId: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EventCapacityGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage(EVENT_CAPACITY_SUBSCRIBE_EVENT)
  handleSubscribe(
    @MessageBody() payload: EventCapacitySubscriptionPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(this.buildEventRoom(payload.eventId));
  }

  @SubscribeMessage(EVENT_CAPACITY_UNSUBSCRIBE_EVENT)
  handleUnsubscribe(
    @MessageBody() payload: EventCapacitySubscriptionPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(this.buildEventRoom(payload.eventId));
  }

  buildEventRoom(eventId: string): string {
    return `event:${eventId}`;
  }
}
