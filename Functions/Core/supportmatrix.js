process.on("message", (message) => {
  const transactions = message.transactions;
  const mfs = message.globalmfs;

  var supportset = [];

  for (var i = 0; i < mfs.length; i++) {
    var subs = getAllSubsets(mfs[i]);
    for (var j = 0; j < subs.length; j++) {
      // code for if contains
      if (subs[j].length != 0) {
        var cont = ContainsInSet(supportset, subs[j]);
        //console.log(subs[j])
        if (!cont) {
          var sup = GetItemsetSupportCount(transactions, subs[j]);
          var obj = {
            items: subs[j],
            support: sup,
          };
          //console.log(obj)
          supportset.push(obj);
        }
      }
    }
    //console.log(subs)
  }
  //console.log(supportset)
  process.send(supportset)
});

const getAllSubsets = (theArray) =>
  theArray.reduce(
    (subsets, value) => subsets.concat(subsets.map((set) => [...set, value])),
    [[]]
  );

function ContainsInSet(mainSet, Itemset) {
  for (var i = 0; i < mainSet.length; i++) {
    var subset = mainSet[i].items;
    var count = 0;
    if (Itemset.length == subset.length) {
      for (var j = 0; j < Itemset.length; j++) {
        if (subset.includes(Itemset[j])) {
          count = count + 1;
        }
      }
      if (count == Itemset.length) {
        return true;
      }
    }
  }
  return false;
}

function GetItemsetSupportCount(transactionset, Itemset) {
  var total = 0;
  for (var i = 0; i < transactionset.length; i++) {
    var foundmatch = ItemsetInTransaction(Itemset, transactionset[i]);
    if (foundmatch) {
      total = total + 1;
    }
  }
  return total;
}

function ItemsetInTransaction(a, h) {
  var b = h.itemcodes;
  var l = a.length;
  var count = 0;
  for (var x in a) {
    var bo = b.includes(a[x]);
    if (bo) {
      count = count + 1;
    }
  }
  if (count == l) {
    return true;
  } else {
    return false;
  }
}
