import express ,{type Request, Response} from 'express';
import mongoose from 'mongoose';
import { requireAuth, NotFoundError,NotAuthorizedError } from '@ajaisgtickets/common';
import { Order, OrderStatus } from '../models/orders';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-class-wrapper';
const router=express.Router()
router.delete('/api/orders/:orderId',async(req: Request,res:Response)=>{
    const orderId=req.params.orderId;
    if(!mongoose.Types.ObjectId.isValid(orderId)){
        throw new NotFoundError()
    }
    const order=await Order.findById(orderId).populate('ticket') // Order does not need ticket info
    if (!order){
        throw new NotFoundError()
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError('order not in accout scope')
    }
    order.status=OrderStatus.Cancelled
    await order.save()
    await new OrderCancelledPublisher(natsWrapper.client).publish({
          id: order.userId,
          
          
         
          ticket: {
            id: order.ticket.id,
            
          }
        })
res.status(204).send(order)
})
export {router as deleteOrderRouter}