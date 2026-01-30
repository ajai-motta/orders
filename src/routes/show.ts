import express ,{type Request, Response} from 'express';
const router=express.Router()
router.get('/api/orders/:orderId',async(req: Request,res:Response)=>{
res.send({})
})
export {router as showOrdersRouter}