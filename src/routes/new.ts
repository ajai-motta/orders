import express, { type Request, Response } from "express";
import mongoose from "mongoose";
import { requireAuth, validateRequest,NotFoundError,OrderStatus,BadRequestError } from "@ajaisgtickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/tickets";
import { Order } from "../models/orders";
const router = express.Router();
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
    res.send({});
  },
);
export { router as createOrderRouterNew };
