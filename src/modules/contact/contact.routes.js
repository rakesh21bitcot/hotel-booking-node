import { Router } from 'express';
import { ContactController } from './contact.controller.js';

const router = Router();

router.post('/contact', ContactController.create);

export default router;

