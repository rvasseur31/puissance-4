import { Router } from "express";
import { AuthController } from "./auth.controller";
import { factory } from "../utils/ConfigLog4j";

/**
 * Logger.
 */
const LOGGER = factory.getLogger("RootController.ts");

/**
 * Basic controller.
 */
export const RootController = Router();

/**
 * Auth controller route definition.
 */
RootController.use('/auth', AuthController);

/**
 * Default route.
 * Return a simple message.
 */
RootController.get('/', (req, res) => {
  LOGGER.debug("Hello world");
  res.send("Hello world");
});