import { Message } from "node-nats-streaming";
import { Listener,Subjects,TicketCreatedEvent } from "@ajaisgtickets/common";
import {Ticket} from '../../models/tickets';
import { queueGroupName } from "./que-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
   readonly subject=Subjects.TicketCreated;
   queueGroupName=queueGroupName;
   async onMessage(data: TicketCreatedEvent['data'], msg: Message){
       const {id,title, price}=data;
       //build function can not handle id handle it
       const ticket=Ticket.build({
        id,
        title, price
       })
      await  ticket.save()
      msg.ack()
   }
}