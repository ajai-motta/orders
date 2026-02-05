import {Publisher,OrdercancelledEvent,Subjects} from '@ajaisgtickets/common'
export class OrderCancelledPublisher extends Publisher<OrdercancelledEvent>{
subject: Subjects.Ordercancelled=Subjects.Ordercancelled;
}