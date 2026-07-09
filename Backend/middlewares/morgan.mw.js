require("dotenv").config()
const morgan = require("morgan")
const fs = require("fs")
const express = require("express")
const app = express()

exports.usingMorgan = () => {
    return morgan("combined", {
        stream: app.get("env") == "development" ? fs.createWriteStream("./temp/access.log", {flags: "a"}) : ""
    })   
}