import { 
    Request, 
    Response, 
    NextFunction 
} from "express";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {

    console.error(error);

    return res.status(500).json({
        success: false,
        message: 'Interval server error'
    });

}