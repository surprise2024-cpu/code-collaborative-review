import { Router } from "express";
import { 
    register, 
    login 
} from "../controllers/authController.js";
import { validateRequiredFields } from "../middleware/validationMiddleware.js";

const router = Router();

router.post(
    '/register', 
    validateRequiredFields(
        'name',
        'email',
        'password',
        'role'
    ),
    register
);

router.post(
    '/login', 
    validateRequiredFields(
        'email', 
        'password'
    ),
    login
);

export default router;