import { OrderCreatedEvent,Publisher,Subjects } from "@ajaisgtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
readonly subject=Subjects.OrderCreated;

}