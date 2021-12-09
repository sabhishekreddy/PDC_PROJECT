const transactionset = [
  { transactionid: 1, itemcodes: [1, 3, 20, 23] },
  { transactionid: 2, itemcodes: [3, 4, 23] },
  { transactionid: 3, itemcodes: [1, 3, 20, 23] },
  { transactionid: 4, itemcodes: [1, 3, 4, 23] },
  { transactionid: 5, itemcodes: [1, 3, 4, 20, 23] },
  { transactionid: 6, itemcodes: [3, 4, 20] },
];

const c = [1,3,4,20,23];
const mfset = [];
var minsupp = 50;

const frequencyset = [
  { frequentid: 2, support: 83, size: 1, itemcodes: [23] },
  { frequentid: 3, support: 67, size: 1, itemcodes: [1] },
  { frequentid: 4, support: 67, size: 1, itemcodes: [4] },
  { frequentid: 5, support: 67, size: 1, itemcodes: [20] },
  { frequentid: 6, support: 83, size: 2, itemcodes: [3, 23] },
  { frequentid: 7, support: 67, size: 2, itemcodes: [1, 3] },
  { frequentid: 8, support: 67, size: 2, itemcodes: [1, 23] },
  { frequentid: 9, support: 67, size: 2, itemcodes: [3, 4] },
  { frequentid: 10, support: 67, size: 2, itemcodes: [3, 20] },
  { frequentid: 11, support: 50, size: 2, itemcodes: [1, 20] },
  { frequentid: 12, support: 50, size: 2, itemcodes: [4, 23] },
  { frequentid: 13, support: 50, size: 2, itemcodes: [20, 23] },
  { frequentid: 14, support: 67, size: 3, itemcodes: [1, 3, 23] },
  { frequentid: 15, support: 50, size: 3, itemcodes: [1, 3, 20] },
  { frequentid: 16, support: 50, size: 3, itemcodes: [1, 20, 23] },
  { frequentid: 17, support: 50, size: 3, itemcodes: [3, 4, 23] },
  { frequentid: 18, support: 50, size: 3, itemcodes: [3, 20, 23] },
  { frequentid: 19, support: 50, size: 4, itemcodes: [1, 3, 20, 23] },
  { frequentid: 1, support: 100, size: 1, itemcodes: [3] },
];

function zigzag(I,C,L){
    C.forEach((element)=>{
        var I1 = Union(I, element);
        var P1 = findP(element, C);
        var H = ArrayUnion(I1, P1);
        //console.log(C," and",element," and ",P1, " and union ",H)
        var hassuperset = FindItemsetInMFS(H);
        if (hassuperset) {
            //console.log("Found H: ",H," in MFS")
            return 0;
        }
        var c1 = Extend(I1, P1);
        //console.log("The c1 is",c1)
        if(c1 == null){
            var hset = FindItemsetInMFS(I1)
            //console.log("The hset of",I1," is ",hset)
            if(!hset){
                mfset.push(I1)
                console.log(mfset)
            }
        }else{
            zigzag(I1,c1,L+1)
        }
    })
}

zigzag([],c,0)

function Extend(I, P) {
  var ck = [];
  P.forEach((y) => {
    var ydash = y;
    var comb = Union(I, ydash);
    var supp = GetItemsetSupport(transactionset, comb);
    if (supp >= minsupp) {
        //console.log("the combination ",comb," is with support",supp)
        ck.push(y);
    }
  });
  if(ck.length == 0){
      return null;
  }
  return ck;
}

function updateMFS(Itemset){
    var foundParts = [];
    var k = 0;
    var l = mfset.length;
    var count = 0;
    for(var i=0;i<mfset.length;i++){
        var boo = UpdateItemsetInMFS(Itemset,mfset[i])
        if(boo){
            return "updated"
        }
    }
    if(count == l){
        return true;
    }else{
        return false;
    }
}

function UpdateItemsetInMFS(a,h){
    var b = h.itemcodes
    var l = a.length;
    var count =0;
    for(var x in a){
        var bo = b.includes(a[x])
        if(bo){
            count = count + 1;
        }
    }
    if((count == h.itemcodes.length) && (l>h.itemcodes.length)){
        return true;
    }else{
        return false;
    }
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
        //console.log(a[x],x)
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
    //console.log(transactionset)
    var total = 0;
    for(var i=0;i<transactionset.length;i++){
        var foundmatch = ItemsetInTransaction(Itemset,transactionset[i])
        if(foundmatch){
            total = total + 1;
        }
    }
    //console.log(total/transactionset.length)
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
  //console.log(Pdash);
  return Pdash;
}
