import { 
    Router 
} from "express";

import { 
    authenticateToken 
} from "../middleware/authMiddleware.js";

import { 
    getProfile, 
    updateProfile, 
    deleteProfile 
} from "../controllers/userController.js";



const router = Router();

router.get(
    '/:id', 
    authenticateToken, 
    getProfile
);

router.put(
    '/:id', 
    authenticateToken, 
    updateProfile
);

router.delete(
    '/:id',
    authenticateToken,
    deleteProfile
);

export default router;