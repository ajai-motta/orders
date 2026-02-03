import express ,{type Request, Response} from 'express';
import mongoose from 'mongoose';
import { requireAuth,NotFoundError,NotAuthorizedError } from '@ajaisgtickets/common';
import { Order } from '../models/orders';
const router=express.Router()
router.get('/api/orders/:orderId',requireAuth,async(req: Request,res:Response)=>{
    const orderId=req.params.orderId;
    if(!mongoose.Types.ObjectId.isValid(orderId)){
        throw new NotFoundError()
    }
    const order=await Order.findById(orderId).populate('ticket')
    if (!order){
        throw new NotFoundError()
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError('order not in accout scope')
    }
res.send({})
})
export {router as showOrdersRouter}