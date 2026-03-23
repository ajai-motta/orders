import { Subjects,Listener,paymentCreatedEvent,OrderStatus } from "@ajaisgtickets/common";
import { queueGroupName } from "./que-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { OrderUpdatedPublisher } from "../publishers/order-updated-publisher";
export class PaymentCreatedListener extends Listener<paymentCreatedEvent>{
    subject: Subjects.PaymentCreated=Subjects.PaymentCreated;
    queueGroupName: string=queueGroupName;
    async onMessage(data: { orderId: string; id: string; paymentId: string; }, msg: Message) {

        const order=await Order.findById(data.orderId)
         if(!order){
            throw new Error('order not found in orders payment created listner listener')
        }
        order.set({status: OrderStatus.AwaitingPayment })
       await  order.save()
       // new OrderUpdatedPublisher(this.client).publish({id: order.id,status: order.status,version:order.version})
        msg.ack()

    }
}