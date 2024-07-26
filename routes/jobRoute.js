import express from "express";
import isAuthenticated from "../auth/isAuthenticated.js";
import { getAllJobs, getJobById, getJobByLoggedAdminUser, postJob, updateJobInformation } from "../controllers/jobController.js";
 
const router = express.Router();

router.route("/postjob").post( isAuthenticated , postJob);
router.route("/all").get( isAuthenticated , getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getJobByLoggedAdminUser);
router.route("/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put( isAuthenticated, updateJobInformation);



export default router;