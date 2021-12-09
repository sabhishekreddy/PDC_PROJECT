//import cp  from 'child_process';
const {fork} = require('child_process')
var fs = require("fs");
const mysql = require('mysql2/promise');
const express = require("express")
const app = express();

var globalsend = false;
var asiasend = false;
var australiasend = false;
var europesend = false;

//The database listener which listenes for changes in mysql
const databaselistener = fork("./Functions/Database/trigger.js")

// Regional databases
const asia = fork("./Functions/Core/regional.js")
const australia = fork("./Functions/Core/regional.js")
const europe = fork("./Functions/Core/regional.js")
const mfsserver = fork("./Functions/Database/mfs.js")
var asiamfs = [];
var europemfs = [];
var australiamfs = [];
var globalmfs = [];
var gotdata = false;
var gotmfs = false;
var globalminsupport;
var gotsupports = false;
var ChangedServer;
var realfilterglobalsupport = [];

var asiantransactions = [];
var totalasiantransactions = 0;
var australiantransactions = [];
var totalaustraliantransactions = 0;
var europeantransactions = []
var totaleuropeantransactions = 0;

var asiansupport = [];
var australiansupport = [];
var europeansupport = [];

var gotasiantrans = false;
var gotaustraliantrans = false;
var goteuropeantrans = false;
var gbcalculated = false;
var ascalculated = false;
var auscalculated = false;
var eurcalculated = false;

async function GetItemDescription(database,a){
    var obj = {
        host: "localhost",
        user: "root",
        password: "1234",
        database: database,
    }
    var lis = []; 
    const connection = await mysql.createConnection(obj);
    for(var i=0;i<a.length;i++){
        var k = [];
        for(var j=0;j<a[i].length;j++){
            const q = `select itemdescription from transactions where itemcode = ${a[i][j]}`;
            const [rows,fields] = await connection.execute(q);
            k.push(rows[0].itemdescription)
        }
        lis.push(k)
    }
    console.log(database,lis)
    return lis;
}

app.get("/global",function(req,res){
    setInterval(()=>{
        if(gbcalculated){
            res.send(JSON.stringify(realfilterglobalsupport))
            gbcalculated = false;
        }
    },1000)
})

app.get("/asia",function(req,res){
    setInterval(()=>{
        if(ascalculated){
            var l = GetItemDescription('asia',asiamfs)
            res.send(JSON.stringify(asiamfs))
            ascalculated = false;
        }
    },1000)
})

app.get("/australia",function(req,res){
    setInterval(()=>{
        if(auscalculated){
            var l = GetItemDescription('australia',australiamfs)
            res.send(JSON.stringify(australiamfs))
            auscalculated = false;
        }
    },1000)
})

app.get("/europe",function(req,res){
    setInterval(()=>{
        if(eurcalculated){
            var l = GetItemDescription('europe',europemfs)
            res.send(JSON.stringify(europemfs))
            eurcalculated = false;
        }
    },1000)
})

// Event listener functions for Database
databaselistener.send({
    "event": "start-listening"
})


app.listen(3000,()=>{
    console.log("Started listening on port 3000")
})

//  && message.table == "transactions"

databaselistener.on("message",(message)=>{
    if(message.event == "database-event" && message.table == "transactions"){
        ChangedServer = message.database;
        var transactionset = fork("./Functions/Database/transactions.js");
        var frequentset = fork("./Functions/Database/frequent.js");
        var DisItemset = fork("./Functions/Database/DisItemset.js");
        var obj = {
            'event':'data',
            'database':message.database
        }
        console.log("Index: Object when the database is updated is: ",obj)
        // getting transactions and sending it to the regionsl servers
        transactionset.send(obj)
        transactionset.on('message',m1=>{
            DisItemset.send(obj)
            DisItemset.on('message',m2=>{
                frequentset.send(obj)
                frequentset.on('message',m3=>{
                    var ob = {
                        'event':'start',
                        'transactionset':m1,
                        'itemset':m2,
                        'frequentset':m3
                    }
                    gotdata = true;
                    console.log("Index: The transactionset from ",message.database," is: ",m1);
                    console.log("Index: The Itemset from ",message.database," is: ",m2);
                    console.log("Index: The FrequentItemset from ",message.database," is: ",m3);
                    console.log("Index: object sending to regional server is: ",ob);
                    if(message.database == "asia"){
                        asia.send(ob)
                        asia.on('message',msg1=>{
                            asiamfs = msg1.slice()
                            console.log("Index: The mfi from the asia",msg1)
                        })
                    }else if(message.database == "australia"){
                        australia.send(ob)
                        australia.on('message',msg2=>{
                            australiamfs = msg2.slice()
                            console.log("Index: The mfi from the australia",msg2)
                        })
                    }else if(message.database == "europe"){
                        europe.send(ob)
                        europe.on('message',msg3=>{
                            europemfs = msg3.slice()
                            console.group("Index: The mfi from the europe server",msg3)
                        })
                    }
                })
            })
        })
    }else{
        console.log("Index: message is inerting into another teble other than transactions")
    }

    setInterval(function(){
        if(gotdata){
            console.log("Index: The mfs values are",asiamfs,australiamfs,europemfs);
            console.log("Index: The Changed Server is",ChangedServer);
            if(ChangedServer == "asia"){
                var arr = ["australia","europe"]
                mfsserver.send({
                    event:"help",
                    databases:arr
                })
                mfsserver.on("message",me=>{
                    //console.log(me)
                    var ausdata = me.s1;
                    for(var j=0;j<ausdata.length;j++){
                        var h = ausdata[j].itemcodes.slice()
                        australiamfs.push(h)
                    }
                    var europedata = me.s2;
                    for(var j=0;j<europedata.length;j++){
                        var h = europedata[j].itemcodes.slice()
                        europemfs.push(h)
                    }
                    gotmfs = true
                })
            }else if(ChangedServer == "australia"){
                var arr = ["asia","europe"]
                mfsserver.send({
                    event:"help",
                    databases:arr
                })
                mfsserver.on("message",me=>{
                    //console.log(me)
                    var asiadata = me.s1;
                    for(var j=0;j<asiadata.length;j++){
                        var h = asiadata[j].itemcodes.slice()
                        asiamfs.push(h)
                    }
                    var europedata = me.s2;
                    for(var j=0;j<europedata.length;j++){
                        var h = europedata[j].itemcodes.slice()
                        europemfs.push(h)
                    }
                    gotmfs = true
                })
            }else if(ChangedServer == "europe"){
                var arr = ["australia","asia"]
                mfsserver.send({
                    event:"help",
                    databases:arr
                })
                mfsserver.on("message",me=>{
                    //console.log(me)
                    var ausdata = me.s1;
                    for(var j=0;j<ausdata.length;j++){
                        var h = ausdata[j].itemcodes.slice()
                        australiamfs.push(h)
                    }
                    var asiadata = me.s2;
                    for(var j=0;j<asiadata.length;j++){
                        var h = asiadata[j].itemcodes.slice()
                        asiamfs.push(h)
                    }
                    gotmfs = true
                })
            }
            //gbcalculated = true;
            ascalculated = true;
            auscalculated = true;
            eurcalculated = true;
            gotdata = !gotdata
        }
    },1000)


    setInterval(function(){
        if(gotmfs){
            //console.log("the database got are",asiamfs,australiamfs,europemfs)
            var localmfs = ArrayUnion(asiamfs,australiamfs);
            globalmfs = ArrayUnion(localmfs,europemfs);

            var asiantrans = fork("./Functions/Database/transactions.js")
            var australiantrans = fork("./Functions/Database/transactions.js")
            var europeantrans = fork("./Functions/Database/transactions.js")

            asiantrans.send({"event":"data","database":"asia"})
            asiantrans.on("message",message=>{
                asiantransactions = message.slice()
                totalasiantransactions = message.slice().length
                console.log("asian total tansactions",totalasiantransactions)
                gotasiantrans = true;
            })

            australiantrans.send({"event":"data","database":"australia"})
            australiantrans.on("message",message=>{
                australiantransactions = message.slice()
                totalaustraliantransactions = message.slice().length
                console.log("australian total transactions",totalaustraliantransactions)
                gotaustraliantrans = true;
            })

            europeantrans.send({"event":"data","database":"europe"})
            europeantrans.on("message",message=>{
                europeantransactions = message.slice()
                totaleuropeantransactions = message.slice().length
                console.log("european total transactions",totaleuropeantransactions)
                goteuropeantrans = true;
                gbcalculated = true;
            })
            gotmfs = !gotmfs
        }
    },1000)


    setInterval(function(){
        if(gotasiantrans && gotaustraliantrans && goteuropeantrans){
            gotasiantrans = !gotasiantrans;
            gotaustraliantrans = !gotaustraliantrans;
            goteuropeantrans = !goteuropeantrans
            
            globalminsupport = 0.5*(totalasiantransactions + totalaustraliantransactions + totaleuropeantransactions)
            console.log("The global min support is: ",globalminsupport)

            var asiansp = fork("./Functions/Core/supportmatrix.js")
            var australiansp = fork("./Functions/Core/supportmatrix.js")
            var europeansp = fork("./Functions/Core/supportmatrix.js")

            asiansp.send({"event":"start","transactions":asiantransactions,"globalmfs":globalmfs})
            asiansp.on("message",message1=>{
                asiansupport = message1.slice();
                australiansp.send({"event":"start","transactions":asiantransactions,"globalmfs":globalmfs})
                australiansp.on("message",message2=>{
                    australiansupport = message2.slice();
                    europeansp.send({"event":"start","transactions":asiantransactions,"globalmfs":globalmfs})
                    europeansp.on("message",message3=>{
                        europeansupport = message3.slice();
                        gotsupports = true;
                    })
                })
            })
        }
        
    },1000)


    setInterval(function(){
        if(gotsupports){ 
            var asiac = [...asiansupport]
            var australiac = [...australiansupport]
            var europec = [...europeansupport]

            var co = SupportUnion(asiac,australiac);
            var globalsupport = SupportUnion(europec,co)
            //console.log(globalminsupport)

            var filterglobalsupport = [...globalsupport];
            SupportFilter(filterglobalsupport);
            //console.log(filterglobalsupport.toString())
            console.log(filterglobalsupport)
            realfilterglobalsupport = [...filterglobalsupport];
            /*fs.writeFile('./input.txt', filterglobalsupport.toString(), function(err) {
                if (err) {
                   return console.error(err);
                }
             });*/
            gotsupports = false
        }
    },1000)
})

function ArrayUnion(I1, I2) {
    var sum = I1.concat(I2);
    //console.log("concat of both",sum)
    var sumset = new Set(sum);
    //console.log("Sum set is",sumset)
    var sumarray = Array.from(sumset);
    return sumarray;
}

function SupportFilter(s){
    for(var i=0;i<s.length;i++){
        if(s[i].support < globalminsupport){
            //console.log("deleting the row",s[i])
            delete s[i]
        }
    }
}

function SupportUnion(a,b){
    var s1 = a;
    var s2 = b;
    for(var i=0;i<s1.length;i++){
        var I = s1[i].items;
        var notf = 0;
        for(var j=0;j<s2.length;j++){
            var m = s2[j].items;
            var bo = CompareArrays(I,m)
            if(bo){
                s2[j].support = s2[j].support + s1[i].support;
            }else{
                notf = notf + 1;
            }
        }
        if(notf == s2.length){
            s2.push(s1[i])
        }
    }
    return s2
}

function CompareArrays(a,b){
    if(a.length == b.length){
        var count = 0;
        for(var i=0;i<a.length;i++){
            if(b.includes(a[i])){
                count = count +1;
            }
        }
        if(count == a.length){
            return true;
        }
    }
    return false
}