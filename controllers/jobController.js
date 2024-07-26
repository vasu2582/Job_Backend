import { Job } from "../models/jobModel.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(", "),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ 
            message: "Failed to creating a new job",
            success: false
        })
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        const query = {
            $and: [
                {
                    $or: [
                        { title: { $regex: keyword, $options: "i" } },
                        { description: { $regex: keyword, $options: "i" } }
                    ]
                },
                { position: { $gt: 0 } }
            ]
        };

        const jobs = await Job.find(query).populate({ path: "company" }).sort({ createdAt: -1 });

        if (!jobs.length) {
            return res.status(404).json({ 
                message: "Jobs are not found!", 
                success: false
            });
        } 

        return res.status(200).json({ 
            jobs, 
            success: true 
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ 
            message: "Failed to get jobs",
            success: false
        });
    }
};


export const getJobById = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications",
        });

        if(!job){
            return res.status(404).json({
                message:"Job not found.",
                success:false
            }) 
        } 

        return res.status(200).json({
            job,
            success:true
        });

    } catch (error) {
        return res.status(400).json({
            message:"Failed to get job",
            success: false
        });
    }
};

// admin
export const getJobByLoggedAdminUser = async (req, res) => {
    try {
        const userId = req.id;
        const jobs = await Job.find({ created_by: userId }).populate({path:'company', createdAt:-1});

        if (!jobs){
            return res.status(404).json({ 
                message: "Jobs are not found", 
                success: false 
            });
        } 
        
        return res.status(200).json({
            jobs,
            success:true
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ 
            message: error,
            success: false 
        });
    }
};

export const updateJobInformation = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position } = req.body;

        // Check if any field is missing
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position) {
            return res.status(400).json({ 
                message: "Please fill all fields", 
                success: false 
            });
        }

        const jobId = req.params.id;

        let job = await Job.findById(jobId);
        if (!job) {
            return res.status(400).json({ 
                message: "Job not found", 
                success: false 
            });
        }

        // Updating fields
        job.title = title;
        job.description = description;
        job.requirements = requirements.includes(",") ? requirements.split(", ") : requirements;
        job.salary = salary;
        job.salary = salary;
        job.location = location;
        job.jobType = jobType;
        job.experienceLevel = experience;
        job.position = position;

        await job.save();

        return res.status(200).json({
            message: "Job information updated.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while updating job information.",
            success: false
        });
    }
};
