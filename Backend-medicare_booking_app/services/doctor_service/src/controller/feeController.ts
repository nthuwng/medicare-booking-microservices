import { Request, Response } from "express";
import { createFeeService ,getFeeService} from "src/services/feeServices";

const createFeeController = async (req: Request, res: Response) => {
    try {
        const doctorProfileId = req.params.doctorProfileId;
        const fee = await createFeeService(req.body, doctorProfileId);
        res.status(201).json({
            success: true,
            message: "Tạo thông tin fee thành công.",
            data: fee,
        });
    } catch (error: any) {
        console.error("Error creating fee:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFeeController = async (req: Request, res: Response) => {
    try {
        const doctorProfileId = req.params.doctorProfileId;
        const fee = await getFeeService(doctorProfileId);
        res.status(200).json({
            success: true,
            message: "Lấy thông tin fee thành công.",
            data: fee,
        });
    } catch (error: any) {
        console.error("Error getting fee:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { createFeeController ,getFeeController};
