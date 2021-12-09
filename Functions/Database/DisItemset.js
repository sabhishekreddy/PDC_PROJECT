const mysql = require("mysql2/promise");


process.on('message',message=>{
  if(message.event == "data"){
    GetItems(message.database).then(value=>{
      process.send(value)
    }).catch(e=>{
      console.log(e)
    })
  }
})

async function GetRawItems(database) {
  var cobj = {
    host: "localhost",
    user: "root",
    password: "1234",
    database: database,
  }
  const connection = await mysql.createConnection(cobj);
  const q = "select distinct(itemcode) from uk.transactions";
  const [rows, fields] = await connection.execute(q);
  return rows;
}

function ArrangeTransactions(arr) {
  var distict = [];
  var i = 0;
  for (i = 0; i < arr.length; i++) {
      distict.push(arr[i].itemcode);
  }
  return distict;
}

async function GetItems(database){
  var raw = await GetRawItems(database);
  var dist = ArrangeTransactions(raw)
  return dist;
}
