const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const SignupUser = sequelize.define("SignupUser", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpfCnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^\d{11}$|^\d{14}$/
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = SignupUser;
