import mongoose from "mongoose";

import { Order ,OrderStatus} from "./orders";
// we do this model because we use events to communicate and store tickets seperatly in this db sepate from Tickets
interface ticketAttrs{
    id: string;
title: string;
price: number;
}
export interface TicketDoc extends mongoose.Document{
title: string;
price: number;
isReserved():Promise<Boolean>;
}
interface TicketModel extends mongoose.Model<TicketDoc>{
build(attrs:ticketAttrs):TicketDoc
}
const ticketSchema=new mongoose.Schema({
    title:{ type:String,
    required: true},
    price: {
        type: Number,
        required: true,
        min: 0
    }
},{
    toJSON:{
        transform(doc,ret,){
            (ret as any).id=ret._id;
            delete (ret as any)._id
        }
    }
})
ticketSchema.statics.build=(attrs:ticketAttrs)=>{
    return new Ticket({
        _id : attrs.id,
        title: attrs.title,
        price: attrs.price
    })//id must be a valid objext id in the form of string dont forget it
}
ticketSchema.methods.isReserved=async function (){
const exixtingOrder=await Order.findOne({
      ticket: this,
      status:{
        $in :[
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
          OrderStatus.Created
        ]

        
      }
    })
    return !!exixtingOrder
}
const Ticket=mongoose.model<TicketDoc,TicketModel>('Ticket',ticketSchema)
export {Ticket}