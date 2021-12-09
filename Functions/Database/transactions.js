const mysql = require("mysql2/promise");

process.on('message',message=>{
  if(message.event == "data"){
    var s = message.database;
    GetTransactions(s).then((v)=>{
      process.send(v)
    }).catch((e)=>{
        console.log(e)
    })
  }
})

async function GetRawFrequentItems(database) {
  var cobj = {
    host: "localhost",
    user: "root",
    password: "1234",
    database: database,
  }
  const connection = await mysql.createConnection(cobj);
  const q = "select * from transactions";
  const [rows, fields] = await connection.execute(q);
  return rows;
}

function ArrangeTransactions(arr) {
  var mfiset = [];
  var distict = [];
  var i = 0;
  for (i = 0; i < arr.length; i++) {
    if (!distict.includes(arr[i].transactionid)) {
      var b = {
        transactionid: arr[i].transactionid,
        itemcodes: [arr[i].itemcode],
      };
      mfiset.push(b);
      distict.push(arr[i].transactionid);
    } else {
      for (var k = 0; k < mfiset.length; k++) {
        if (mfiset[k].transactionid == arr[i].transactionid) {
          mfiset[k].itemcodes.push(arr[i].itemcode);
        } else {
          continue;
        }
      }
    }
  }
  return mfiset;
}

async function GetTransactions(database) {
  const r = await GetRawFrequentItems(database);
  const data = ArrangeTransactions(r);
  return data;
}
