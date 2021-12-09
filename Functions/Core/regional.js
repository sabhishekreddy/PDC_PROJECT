process.on("message",message=>{
    var mfset = [];
    var minsupp = 50;
    var transactionset = message.transactionset;
    if(message.event == "start"){

        zigzag([],message.itemset,0)
        process.send(mfset)

    }

    // The declaration of functions
    function zigzag(I,C,L){
        C.forEach((element)=>{
            var I1 = Union(I, element);
            var P1 = findP(element, C);
            var H = ArrayUnion(I1, P1);
            var hassuperset = FindItemsetInMFS(H);
            if (hassuperset) {
                return 0;
            }
            var c1 = Extend(I1, P1);
            if(c1 == null){
                var hset = FindItemsetInMFS(I1)
                if(!hset){
                    mfset.push(I1)
                }
            }else{
                zigzag(I1,c1,L+1)
            }
        })
    }

    function Extend(I, P) {
        var ck = [];
        P.forEach((y) => {
          var ydash = y;
          var comb = Union(I, ydash);
          var supp = GetItemsetSupport(transactionset, comb);
          if (supp >= minsupp) {
              ck.push(y);
          }
        });
        if(ck.length == 0){
            return null;
        }
        return ck;
      }
      
      function FindItemsetInMFS(Itemset){
          var l = mfset.length;
          for(var i=0;i<mfset.length;i++){
              var boo = ItemsetInMFS(Itemset,mfset[i])
              if(boo){
                  return true;
              }
          }
          return false;
      }
      
      function ItemsetInMFS(a,h){
          var b = h;
          var l = a.length;
          var count = 0;
          for(var x in a){
              var bo = b.includes(a[x])
              if(bo){
                  count = count + 1;
              }
          }
          if((count == l)){
              return true;
          }else{
              return false;
          }
      }
      
      function GetItemsetSupport(transactionset,Itemset){
          var total = 0;
          for(var i=0;i<transactionset.length;i++){
              var foundmatch = ItemsetInTransaction(Itemset,transactionset[i])
              if(foundmatch){
                  total = total + 1;
              }
          }
          return (total/transactionset.length)*100;
      }
      
      function ItemsetInTransaction(a,h){
          var b = h.itemcodes
          var l = a.length;
          var count = 0;
          for(var x in a){
              var bo = b.includes(a[x])
              if(bo){
                  count = count + 1;
              }
          }
          if((count == l)){
              return true;
          }else{
              return false;
          }
      }
      
      function Union(I1, item) {
        var Il = I1.slice();
        if (!Il.includes(item)) {
          Il.push(item);
        }
        return Il;
      }
      
      function ArrayUnion(I1, I2) {
        var sum = I1.concat(I2);
        var sumset = new Set(sum);
        var sumarray = Array.from(sumset);
        return sumarray;
      }
      
      function findP(x, P) {
        var index = P.indexOf(x);
        var len = P.length;
        var Pdash = P.slice(index + 1, len);
        return Pdash;
      }
 
})