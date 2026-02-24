import { Listener,ExpirationCompleteEvent,Subjects,OrderStatus } from "@ajaisgtickets/common";
import { queueGroupName } from "./que-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete=Subjects.ExpirationComplete;
    queueGroupName=queueGroupName;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order=await Order.findById(data.orderId).populate('ticket')
        if(!order){
            throw new Error('order not found in orderexpired listener')
        }
        order.set({status:OrderStatus.Cancelled})// to be revisited
        await order.save()
        await new OrderCancelledPublisher(this.client).publish({id: order.id,version: order.version,ticket: {id: order.ticket.id}})
        msg.ack()
    }
}
