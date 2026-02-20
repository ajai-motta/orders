import mongoose from "mongoose"
import { OrderStatus } from "@ajaisgtickets/common";
import { TicketDoc } from "./tickets";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
export {OrderStatus}
interface orderAttrs{
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}
interface orderDoc extends mongoose.Document{
     userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}
interface orderModel extends mongoose.Model<orderDoc>{
    build(attr: orderAttrs): orderDoc;
}
const orderSchema=new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    }
    ,
    expiresAt: {
        type: mongoose.Schema.Types.Date
    }
    ,
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
        //This ObjectId points to a document in the Ticket collection
    },
},{
    toJSON: {
        transform(doc,ret){
            (ret as any).id=ret._id
             
              
              delete (ret as any)._id
        }
    }
})
orderSchema.set('versionKey','version')
orderSchema.plugin(updateIfCurrentPlugin)
orderSchema.statics.build =(attrs: orderAttrs)=>{
return new Order(attrs)
}
const Order=mongoose.model<orderDoc,orderModel>('Order',orderSchema)
export {Order}