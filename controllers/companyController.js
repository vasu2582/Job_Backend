import { Company } from "../models/companyModel.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company Name is required.",
                success: false
            });
        };

        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "Company already exist",
                success: false
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company Registered Successfully.",
            company,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ 
            error,
            success: false
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.id;

        const companies = await Company.find({ userId });
        if (!companies){
            return res.status(404).json({ 
                message: "company not found", 
                success: false 
            });
        } 

        return res.status(200).json({ 
            companies,
            success: true 
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ 
            error,
            success: false
        });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        
        if (!company){
            return res.status(404).json({ 
                message: "Company Not Found!", 
                success: false 
            });
        } 

        return res.status(200).json({
            company,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ 
            error,
            success: false
        });
    }
};

export const updateCompanyInformation = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file; 

        let cloudResponse;
        if(file){
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        if(!name || !description || !website || !location){
            return res.status(404).json({ 
                message: "Please Fill All Details", 
                success: false 
            });
        }

        const companyId = req.params.id; // Assume req.id contains the user's ID

        let company = await Company.findById(companyId);
        if (!company) {
            return res.status(400).json({ 
                message: "Company not found", 
                success: false 
            });
        }

        if(!company.logo && !file){
            return res.status(400).json({ 
                message: "Insert Company Logo", 
                success: false 
            });
        }

        // Updating...
        if (name) company.name = name;
        if (description) company.description = description;
        if (website) company.website = website;
        if (location) company.location = location;

        if(file){
            if (cloudResponse) {
                company.logo = cloudResponse.secure_url; // Save the Cloudinary URL
            }
        }

        await company.save();

        return res.status(200).json({
            message: "Company information updated.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while updating company information.",
            success: false
        });
    }
};