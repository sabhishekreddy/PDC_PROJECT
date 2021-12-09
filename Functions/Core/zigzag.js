var transactionset = [];
var frequentset = [];
var mfset = [];

process.on('message',message=>{
    transactionset = message.transactionset;
    frequentset = message.frequentset;
    //console.log(message)
    GetItemsetSupport(transactionset,[1,20])
    process.send("I will")
})

function GetItemsetSupport(transactionset,Itemset){
    console.log(transactionset)
    var total = 0;
    for(var i=0;i<transactionset.length;i++){
        var foundmatch = ItemsetInTransaction(Itemset,transactionset[i])
        if(foundmatch){
            total = total + 1;
        }
    }
    console.log(total/transactionset.length)
    return total;
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

// Functions
function Union(Il,item){
    if(!Il.includes(item)){
        Il.push(item)
        return Il;
    }else{
        return Il;
    }
}

function ArrayUnion(I1,I2){
    var sum = I1.concat(I2)
    var sumset = new Set(sum);
    var sumarray = Array.from(sumset)
    return sumarray;
}

function findP(x,P){
    var index = P.indexOf(x);
    var len = P.length
    var Pdash = P.slice(index+1,len)
    console.log(Pdash)
}

function FindItemsetInMFS(Itemset){
    for(var i=0;i<mfset.length;i++){
        var boo = ItemsetInMFS(Itemset,mfset[i])
        if(boo){
            return boo;
        }
    }
}

function ItemsetInMFS(a,h){
    var b = h.itemcodes
    var l = a.length;
    var count =0;
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

function zigzag(I,C,l){
    C.forEach(element => {
        var I1 = Union(I,element)
        var P1 = findP(element,C)
        var H = ArrayUnion(I[l+1],P)
        // if H has superset in MFI then return
        var hassuperset = FindItemsetInMFS(H);
        if(hassuperset){
            return
        }
        
        //Extend Function 
        var c1 = Extend(I1,P1);
        /*if(c1 == null){
            // if c1 has no superset in MFI then update MFI
            //else ZigZag(I1,C1,L1)
        }*/
        
    });
}

function Extend(I,P){
    var ck = [];
    P.forEach(y=>{
        var ydash = y
        console.log(y)
        var comb = Union(I,ydash)
        // comb is a retained itemset
        var supp = GetItemsetSupport(transactionset,comb)
        if(supp >= minsupp){
             ck.push(y)
        }
        //calculating the support and updating on condition
        return ck;
    })
}