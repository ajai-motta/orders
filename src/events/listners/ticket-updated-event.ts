import { Message } from "node-nats-streaming";
import { Listener,NotFoundError,Subjects,TicketUpdatedEvent } from "@ajaisgtickets/common";
import {Ticket} from '../../models/tickets';
import { queueGroupName } from "./que-group-name";
export class TicketUpdatedListner extends Listener<TicketUpdatedEvent>{
readonly subject=Subjects.TicketUpdated;
queueGroupName=queueGroupName
async onMessage(data: { id: string; title: string; price: number; userId: string; }, msg: Message) {
    const {id,title,price}=data;
    const ticket=await Ticket.findById(id)
    if(!ticket){
        console.log('ticket not found when updating')
        throw new NotFoundError()
    }
    ticket.set({title,price})
    await ticket.save()
    msg.ack()
}
}