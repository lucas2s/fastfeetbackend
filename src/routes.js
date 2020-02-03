import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import DeliveryMenController from './app/controllers/DeliveryMenController';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);
routes.get('/recipients/:id', RecipientController.indexById);

routes.post('/deliverymen', DeliveryMenController.store);
routes.put('/deliverymen/:id', DeliveryMenController.update);
routes.delete('/deliverymen/:id', DeliveryMenController.delete);
routes.get('/deliverymen/:id', DeliveryMenController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
