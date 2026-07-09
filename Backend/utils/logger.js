const { error } = require("console")
const express = require("express")
const { access } = require("fs")
const app = express()
require("dotenv").config()
const log4js = require("log4js")

if(app.get("env") == "development"){
    log4js.configure({
        appenders: {
            access: {
                type: "dateFile",
                filename: "./temp/access.log",
                pattern: "-yyyy-MM-dd"
            },
            error: {
                type: "dateFile",
                filename: "./temp/error.log",
                pattern: "-yyyy-MM-dd"
            }
        },
        categories: {
            default: { appenders: ["access"], level: "ALL" },
            access: { appenders: ["access"], level: "ALL" },
            error: { appenders: ["error"], level: "ALL" }
        }   
    })
}

const acceso = log4js.getLogger("access")
const err = log4js.getLogger("error")

module.exports = {
    access: acceso,
    error: err,
    express: log4js.connectLogger(acceso)
}