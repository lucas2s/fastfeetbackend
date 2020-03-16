import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import DeliveryManController from './app/controllers/DeliveryManController';
import DeliveryController from './app/controllers/DeliveryController';
import FileController from './app/controllers/FileController';
import DeliveryDeliveryManController from './app/controllers/DeliveryDeliveryManController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliveryDeliveryProblemController from './app/controllers/DeliveryDeliveryProblemController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.get('/deliveryman/:id/deliveries', DeliveryDeliveryManController.index);
routes.put(
  '/deliveryman/deliveries/:id/start',
  DeliveryDeliveryManController.updateStart
);
routes.put(
  '/deliveryman/deliveries/:id/end',
  DeliveryDeliveryManController.updateEnd
);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.post('/files', upload.single('file'), FileController.store);

// ---------------------------------------------------------------------------------

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);
routes.get('/recipients/:id', RecipientController.indexById);
routes.get('/recipients', RecipientController.index);

routes.post('/deliveryman', DeliveryManController.store);
routes.put('/deliveryman/:id', DeliveryManController.update);
routes.delete('/deliveryman/:id', DeliveryManController.delete);
routes.get('/deliveryman/:id', DeliveryManController.indexById);
routes.get('/deliveryman', DeliveryManController.index);

routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);
routes.get('/deliveries', DeliveryController.index);

routes.get(
  '/deliveries/problems',
  DeliveryDeliveryProblemController.indexProblem
);
routes.get(
  '/deliveries/:id/problems',
  DeliveryDeliveryProblemController.indexByIdProblem
);

routes.delete(
  '/problem/:id/cancel-delivery',
  DeliveryDeliveryProblemController.delete
);

export default routes;
