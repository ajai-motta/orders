import mongoose from "mongoose";

import { Order ,OrderStatus} from "./orders";
interface ticketAttrs{
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
    return new Ticket(attrs)
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