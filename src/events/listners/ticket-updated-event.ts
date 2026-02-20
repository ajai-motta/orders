import { Message } from "node-nats-streaming";
import { Listener,NotFoundError,Subjects,TicketUpdatedEvent } from "@ajaisgtickets/common";
import {Ticket} from '../../models/tickets';
import { queueGroupName } from "./que-group-name";
import mongoose from "mongoose";
export class TicketUpdatedListner extends Listener<TicketUpdatedEvent>{
readonly subject=Subjects.TicketUpdated;
queueGroupName=queueGroupName
async onMessage(data: TicketUpdatedEvent['data'] , msg: Message) {
    const {title,price,version}=data;
    const ticket=await Ticket.findByPreviosVersion(data)
    if(!ticket){
        console.log('ticket not found when updating')
        throw new NotFoundError()
    }
    ticket.set({title,price})
    await ticket.save()
    msg.ack()
}
}