import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import authGoogleRouter from "./auth-google";
import authMagicLinkRouter from "./auth-magic-link";
import authSmsRouter from "./auth-sms";
import authPasswordResetRouter from "./auth-password-reset";
import companiesRouter from "./companies";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(authGoogleRouter);
router.use(authMagicLinkRouter);
router.use(authSmsRouter);
router.use(authPasswordResetRouter);
router.use(companiesRouter);
router.use(adminRouter);

export default router;
