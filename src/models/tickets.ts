import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
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
version: number;
isReserved():Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
build(attrs:ticketAttrs):TicketDoc;
findByPreviosVersion(event: {id:string;version:number;}):Promise<TicketDoc|null>
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

ticketSchema.set('versionKey','version');
ticketSchema.plugin(updateIfCurrentPlugin)
ticketSchema.statics.build=(attrs:ticketAttrs)=>{
    return new Ticket({
        _id : attrs.id,
        title: attrs.title,
        price: attrs.price
    })//id must be a valid objext id in the form of string dont forget it
}
ticketSchema.statics.findByPreviosVersion= (event:{ id:string;version:number;})=>{
return  Ticket.findOne({
    _id: event.id,
    version: event.version -1
})
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