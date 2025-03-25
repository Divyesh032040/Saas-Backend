


const PriceList = require("../Model/priceList.model");
const User = require("../Model/user.model");
const Client = require("../Model/client.model");

// Create a new price entry (client can create a price list)
const createPriceList = async (req, res) => {
    try {
        const { price } = req.body;
        const clientData = req.user; 

        const user = await Client.findById(clientData?._id);
        if (!user) {
            return res.status(400).json({ message: "Client not found" });
        }
        
        const data = await PriceList.create({
            clientId: clientData?._id,
            price
        })

        res.status(201).json({ message: "Price list created successfully", data });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};












// Update a price entry
const updatePriceList = async (req, res) => {
    try {
        const { price } = req.body;
        const { id } = req.params;
        const clientData = req.user;

        const user = await Client.findById(clientData?._id);
        if (!user) {
            return res.status(400).json({ message: "Client not found" });
        }

        const priceList = await PriceList.findOneAndUpdate(
            { _id: id, clientId: clientData?._id },
            { price },
            { new: true }
        );

        if (!priceList) {
            return res.status(404).json({ message: "Price list not found or unauthorized" });
        }

        res.status(200).json({ message: "Price list updated successfully", data: priceList });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a price entry
const deletePriceList = async (req, res) => {
    try {
        const { id } = req.params;
        const clientData = req.user;

        const user = await Client.findById(clientData?._id);
        if (!user) {
            return res.status(400).json({ message: "Client not found" });
        }

        const priceList = await PriceList.findOneAndDelete({ _id: id, clientId: clientData?._id });

        if (!priceList) {
            return res.status(404).json({ message: "Price list not found or unauthorized" });
        }

        res.status(200).json({ message: "Price list deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





module.exports = {
    createPriceList ,
    updatePriceList ,
    deletePriceList
}