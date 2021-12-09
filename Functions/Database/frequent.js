const mysql = require('mysql2/promise');

process.on('message',message=>{
    if(message.event == "data"){
        GetFrequentSets(message.database).then(value=>{
          process.send(value)
        }).catch(e=>{
          console.log(e)
        })
    }
})

async function GetRawFrequentItems(database){
    const connection = await mysql.createConnection(
        {host: 'localhost',
        user: 'root',
        password:'1234',
        database:database});
    const q = "select * from frequentitemsets"
    const [rows,fields] = await connection.execute(q)
    return rows;
  }


  function GroupFrequentSets(arr){
    var mfiset = [];
    var distict = [];
    var i=0;
    for(i=0;i<arr.length;i++){
        if(!distict.includes(arr[i].frequentid)){
            var b = {
                'frequentid':arr[i].frequentid,
                'support':arr[i].support,
                'size':arr[i].size,
                'itemcodes':[arr[i].itemcode]
            }
            mfiset.push(b)
            distict.push(arr[i].frequentid)
        }else{
            for(var k=0;k<mfiset.length;k++){
                if(mfiset[k].frequentid == arr[i].frequentid){
                    mfiset[k].itemcodes.push(arr[i].itemcode)
                }else{
                    continue;
                }
            }
        }
    }
    return mfiset;
}


async function GetFrequentSets(s){
    const r = await GetRawFrequentItems(s);
    const data = GroupFrequentSets(r)
    return data;
  }

