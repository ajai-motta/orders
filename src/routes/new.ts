import express, { type Request, Response } from "express";
import mongoose from "mongoose";
import { requireAuth, validateRequest,NotFoundError,OrderStatus,BadRequestError } from "@ajaisgtickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/tickets";
import { Order } from "../models/orders";
//nats
import { natsWrapper } from "../nats-class-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
const router = express.Router();
const EXPIRATION_WINDOW_SECONDS=15*60;
router.post(
  "/api/orders/",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage(
        "valid ticket id must be provided, the error can be empty or an invalid id",
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {ticketId}=req.body;
    const ticket=await Ticket.findById(ticketId);
    if(!ticket){
      throw new NotFoundError()
    }
    //in order to make sure that there are no orders with the same *ticket* and not with a cancelled status
    const isReserved=await ticket.isReserved()
    if(isReserved){
      throw new BadRequestError('Ticket is reserved')
    }
    const expiration=new Date();
    expiration.setSeconds(expiration.getSeconds() +EXPIRATION_WINDOW_SECONDS)
    const order=Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket
    })
    await order.save()
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: expiration.toISOString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price
      }
    })
    res.status(201).send(order);
  },
);
export { router as createOrderRouterNew };
