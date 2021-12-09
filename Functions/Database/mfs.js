const mysql = require('mysql2/promise');

process.on('message',message=>{
    if(message.event == "data"){
        var s = message.database;
    //console.log("message to mfs",message)
    GetMFISets(s).then((v)=>{
        process.send(v)
      }).catch((e)=>{
          console.log(e)
      })
    }else if(message.event == "help"){
        var mfsarray = [];
        var databases = message.databases;
        var s1 = databases[0];
        var s2 = databases[1];
        var d = GetMFISets(databases[0]).then((v)=>{
            mfsarray[0] = v.slice()
            GetMFISets(databases[1]).then((v1)=>{
                mfsarray[1] = v1.slice();
                process.send({
                    s1:mfsarray[0],
                    s2:mfsarray[1]
                })
            }).catch((e)=>{
                console.log(e)
            })
          }).catch((e)=>{
              console.log(e)
          })
    }
  })

async function GetRawMFI(database){
    var cobj = {
        host: "localhost",
        user: "root",
        password: "1234",
        database: database,
      }
      //console.log(cobj)
      const connection = await mysql.createConnection(cobj);
    const q = "select * from mfi"
    const [rows,fields] = await connection.execute(q)
    return rows;
  }


  function GroupMFI(arr){
    var mfiset = [];
    var distict = [];
    var i=0;
    for(i=0;i<arr.length;i++){
        if(!distict.includes(arr[i].mfiid)){
            var b = {
                'mfiid':arr[i].mfiid,
                'size':arr[i].size,
                'itemcodes':[arr[i].itemcode]
            }
            mfiset.push(b)
            distict.push(arr[i].mfiid)
        }else{
            for(var k=0;k<mfiset.length;k++){
                if(mfiset[k].mfiid == arr[i].mfiid){
                    mfiset[k].itemcodes.push(arr[i].itemcode)
                }else{
                    continue;
                }
            }
        }
    }
    return mfiset;
}


  async function GetMFISets(dataset){
    const r = await GetRawMFI(dataset);
    const data = GroupMFI(r)
    return data;
  }
