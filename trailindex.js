const {fork} = require('child_process')
var fs = require("fs");

//The database listener which listenes for changes in mysql
const databaselistener = fork("./trailtrigger.js")


console.log("I am trailindex.js")
databaselistener.send({
    "event": "start-listening"
})

databaselistener.on("message",(message)=>{
    if(message.table == "employee"){
        console.log(message)
    }else{
        console.log("This got input into the")
    }
})