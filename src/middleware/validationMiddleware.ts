import { 
    Request, 
    Response, 
    NextFunction 
} from "express";

export function validateRequiredFields(
    ...fields: string[]
) {

    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        for (const field of fields) {

            const value = req.body[field];

            if (
                value === undefined ||
                value === null ||
                (
                    typeof value === 'string' &&
                    value.trim() === ''
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });

            }

        }

        next();

    };

}