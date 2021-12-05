import { Router } from 'express'
import { check, param } from 'express-validator'
import { getAllUsers, addOneUser, updateOneUser, deleteOneUser } from './Users'
import { getOwner, postOwner } from './DNS'


// Dns-route
const dnsRouter = Router();
//const regex = "^((?!-)[A-Za-z0-9-]{1, 63}(?<!-)\\.)+[A-Za-z]{2, 6}$";
const regex = "^((?!-)[A-Za-z0-9-]{0,62}[A-Za-z0-9]\\.)+[A-Za-z]{2,6}$"
//const regex = "[A-Za-z0-9-.]*";

dnsRouter.post('/owner',
  check('domain').custom((value) => {
    console.log(value, value.match(regex))
    if (!value.match(regex)) {
      throw new Error("invalid domain")
    }
    return true
  }),
  postOwner);

dnsRouter.get('/owner',
  check('domain').custom((value) => {
    console.log(value, value.match(regex))
    if (!value.match(regex)) {
      throw new Error("invalid domain")
    }
    return true
  }),
  getOwner);



// User-route
const userRouter = Router();
userRouter.get('/all', getAllUsers);
userRouter.post('/add', addOneUser);
userRouter.put('/update', updateOneUser);
userRouter.delete('/delete/:id', deleteOneUser);


// Export the base-router
const baseRouter = Router();
//baseRouter.use('/users', userRouter);
baseRouter.use('/dns', dnsRouter);
export default baseRouter;
