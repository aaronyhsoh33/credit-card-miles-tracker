import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateMeSchema, changePasswordSchema } from '../schemas/auth.schema';
import * as meController from '../controllers/me.controller';

const router = Router();

router.use(requireAuth);

router.get('/', meController.getMe);
router.patch('/', validate(updateMeSchema), meController.updateMe);
router.patch('/password', validate(changePasswordSchema), meController.changePassword);
router.delete('/', meController.deleteMe);

export default router;
