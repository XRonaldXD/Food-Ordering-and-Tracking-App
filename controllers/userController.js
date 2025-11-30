const User = require('../models/User');

const createuser = async (req, res) => {
    const newuser = new User(req.body);
    try {
        await newuser.save();
        res.json(newuser);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

}

const getusers = async (req, res) => {

    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getSpecuser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const updateuser = async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndUpdate(id, req.body, { new: true });
        const updateuser = await User.findById(id);
        res.status(200).json(updateuser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteuser = async (req, res) => {
    const id = req.params.id;
    try {
        await User.findOneAndDelete(id);
        res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createuser,
    getusers,
    getSpecuser,
    updateuser,
    deleteuser
}; 