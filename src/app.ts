
import express, { Request, Response } from "express";
import { currentUser } from "@ajaisgtickets/common";
import cookieSession from "cookie-session";

import {createOrderRouterNew} from './routes/new'
import { showOrdersRouter } from "./routes/show";
import {myIngeinousRouterForAllOrders} from './routes/index'
import { deleteOrderRouter } from "./routes/delete";

//@ts-ignore
import { errorHandler } from "@ajaisgtickets/common";
//@ts-ignore
import { NotFoundError } from "@ajaisgtickets/common";
const app = express();


// trust traffic even though its comming from proxy  
app.set('trust proxy',true)//trust ingress-nginx
//parse content
app.use(express.json());
//cookie, remember content is a jwt so no encryption on cookie ////to all
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV!=='test',// From https or not based on test env
}))
console.log('current user')
app.use(currentUser)
//very critical bug

console.log('1')
app.use(myIngeinousRouterForAllOrders)
console.log('2')

app.use(createOrderRouterNew)
console.log('3')

app.use(showOrdersRouter)
console.log('4')

app.use(deleteOrderRouter)
console.log('5')

app.all('/{*splat}', async(req,res) => {
  console.log(req.url)
  console.log('route not found in /spat')
  throw new NotFoundError()
});
app.use(errorHandler)

export {app}