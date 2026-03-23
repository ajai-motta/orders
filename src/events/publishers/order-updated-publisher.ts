import { Publisher, Subjects,OrderUpdatedEvent } from "@ajaisgtickets/common";
export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent>{
    subject: Subjects.OrderUpdated=Subjects.OrderUpdated;
}