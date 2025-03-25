var bcrypt = require('bcryptjs');
const User = require("../Model/user.model");
const logger = require("../logger");
const Client = require("../Model/client.model")

class UserService {
    // Create a new user
    async createUser({ payload }) {
        try {
            const { email, password, name , roll , profile} = payload;

            if (!email || !password || !name || ! roll) {
                throw new Error("Email and password are required");
            }

            const response = await User.create({
                email,
                name,
                password,
                roll,
                profile
            });  

            return response;
        } catch (error) {
            logger.error(`Error creating user: ${error.message}`);
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    // Find user by filter
    async findUser(filter) {
        try {
            const response = await Client.findOne(filter);
            return response;
        } catch (error) {
            logger.error(`Error finding user with filter ${JSON.stringify(filter)}: ${error.message}`);
            return null;
        }
    }

    // Encrypt password
    encryption ( password ){
        const salt = bcrypt.genSaltSync(10);
        const hash =  bcrypt.hashSync(password, salt);
        return hash;
    } 

    // Validate password
    async passwordValidate(newPassword, hash) {
        try {
            const isMatch = bcrypt.compareSync(newPassword, hash);
            return isMatch;
        } catch (error) {
            logger.error(`Error validating password: ${error.message}`);
            return error
        }
    }
}

module.exports = new UserService();
