const mysql = require('mysql2/promise');

process.on('message',message=>{
    const database = message.database;
    if(message.event == 'mfi'){

    }  
})

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
            const q = `select itemdescritption from transactions where itemcode = ${a[i][j]}`;
            const [rows,fields] = await connection.execute(q);
            k.push(rows[0].itemdescription)
        }
        lis.push(k)
    }
    return lis;
    console.log(lis)
}