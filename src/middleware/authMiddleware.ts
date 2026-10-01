import {
    Request, 
    Response, 
    NextFunction
} from 'express';

import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    role: 'reviewer' | 'submitter';
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export function authenticateToken(
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
) { 

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });

    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {

        return res.status(401).json({
            success: false,
            message: 'Invalid authentication format'
        });

    }

    try {

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.user = decoded;

        next();
        
    }
    catch {

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });

    }

}

export function authorizeRoles(
    ...allowedRoles: Array<'reviewer' | 'submitter'>
) {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {

        if (!req.user) {

            return res.status(401).json({
                sucess: false,
                message: 'Authentication required'
            });

        }

        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
            
        }

        next();

    }
    
}
