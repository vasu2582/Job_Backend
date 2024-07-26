import { Application } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const { id: jobId } = req.params;

        if (!jobId){
            return res.status(400).json({ 
                message: "Job Id required", 
                success: false 
            });
        } 

        // Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found", 
                success: false 
            });
        }

        // Check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({ 
                message: "You have already applied for this job.",
                success: false 
            });
        }

        
        // Create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Job Applied successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to apply for the job.',
            success: false
        });
    }
};


export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;

        if (!userId){
            return res.status(400).json({ 
                message: "User Id required", 
                success: false 
            });
        } 

        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path:"job",
            options:{sort:{createdAt:-1}},
            populate:{
                path:"company",
                options:{sort:{createdAt:-1}}
            }
        });

        if (!application){
            return res.status(404).json({ 
                message: "No Application", 
                success: false 
            });
        } 
        
        return res.status(200).json({
            application,
            success: true
        });

    } catch (error) {
        return res.status(400).json({ 
            message: "Failed to get applied jobs",
            success: false
        });
    }
};

export const getApplicants = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id){
            return res.status(400).json({ 
                message: "Job Id required", 
                success: false 
            });
        } 

        const job = await Job.findById(id).populate({
            path:"applications",
            options:{sort:{createdAt:-1}},
            populate:{
                path:"applicant"
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }  

        return res.status(200).json({
            job,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Failed to get job applicants",
            success: false
        })
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicantionId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false
            });
        }

        // Find the application by applicant ID
        const application = await Application.findOne({ _id: applicantionId});

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        if (status.toLowerCase() === "accepted") {
            const jobId = application.job;
            const job = await Job.findById(jobId);
            
            if (job.position > 0) {
                await Job.findByIdAndUpdate(
                    jobId, 
                    { $inc: { position: -1 } },
                    { new: true } // To return the updated document
                );
            } else {
                return res.status(400).json({ 
                    message: "No positions available to decrease", 
                    success: false 
                });
            }
        }
      
        // Update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully",
            success: true
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to update status",
            success: false
        });
    }
};