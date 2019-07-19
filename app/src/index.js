import Web3 from "web3";
import supplyChainArtifact from "../../build/contracts/SupplyChain.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = supplyChainArtifact.networks[networkId];
      console.log(deployedNetwork.address); //deployed contract address
      this.meta = new web3.eth.Contract(
        supplyChainArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  productMilkButton: async function() {
    const { productMilk } = this.meta.methods;
    const upc = document.getElementById("upc").value;
    const rancherId = document.getElementById("rancherId").value;
    const rancherName = document.getElementById("rancherName").value;
    const rancherInfo = document.getElementById("rancherInfo").value;
    const productNotes = document.getElementById("productNotesMilk").value;
    await productMilk(upc, rancherId, rancherName, rancherInfo, productNotes).send({from: this.account});
  },

  fetchItemButton: async function() {
    const { fetchItem1 } = this.meta.methods;
    const { fetchItem2 } = this.meta.methods;
    const upc = document.getElementById("upcSearch").value;
    var result1 = await fetchItem1(upc).call();
    var result2 = await fetchItem2(upc).call();
    var itemSku = result1[0];
    var itemType = result1[2];
    var ownerId = result1[3];
    var productorId = result1[4];
    var productorName = result1[5];
    var productorInfo = result1[6];
    var productId = result2[0];
    var productNotes = result2[1];
    var productPrice = result2[2];
    var itemState = 'Producted';
    switch (result2[3]) {
      case '0':
        itemState = 'Producted';
        break;
      case '1':
        itemState = 'Processed';
        break;
      case '2':
        itemState = 'ForSale';
        break;
      case '3':
        itemState = 'Sold';
        break;
      case '4':
        itemState = 'Shipped';
        break;
      case '5':
        itemState = 'Received';
        break;
      case '6':
        itemState = 'Consumed';
        break;
    }
    var distributorId = result2[4];
    var retailerId = result2[5];
    var consumerId = result2[6];
    var usedMilkUpc = result2[7];
    document.getElementById("itemSku").value = itemSku + '';
    document.getElementById("itemType").value = itemType + '';
    document.getElementById("ownerId").value = ownerId + '';
    document.getElementById("productorId").value = productorId + '';
    document.getElementById("productorName").value = productorName + '';
    document.getElementById("productorInfo").value = productorInfo + '';
    document.getElementById("productId").value = productId + '';
    document.getElementById("productNotes").value = productNotes + '';
    document.getElementById("productPrice").value = productPrice + '';
    document.getElementById("itemState").value = itemState + '';
    document.getElementById("distributorId").value = distributorId + '';
    document.getElementById("retailerId").value = retailerId + '';
    document.getElementById("consumerId").value = consumerId + '';
    document.getElementById("usedMilkUpc").value = usedMilkUpc + '';

  },

  processItemButton: async function() {
    const { processItem } = this.meta.methods;
    const upc = document.getElementById("upc").value;
    const rancherId = document.getElementById("rancherId").value;
    await processItem(upc).send({from: rancherId});
  },

  sellItemButton: async function() {
    const { sellItem } = this.meta.methods;
    const upc = document.getElementById("upc").value;
    const rancherId = document.getElementById("rancherId").value;
    var productPrice = document.getElementById("productPriceMilk").value;
    productPrice = Web3.utils.toWei(productPrice + "", "wei");
    await sellItem(upc, productPrice).send({from: rancherId});
  },

  productCheeseButton: async function() {
    const { productCheese } = this.meta.methods;
    const upc = document.getElementById("cheeseUpc").value;
    const cheeseFactoryId = document.getElementById("cheeseFactoryId").value;
    const cheeseFactoryName = document.getElementById("cheeseFactoryName").value;
    const rancheeseFactoryInfocherInfo = document.getElementById("cheeseFactoryInfo").value;
    const productNotesCheese = document.getElementById("productNotesCheese").value;
    const milkUpc = document.getElementById("milkUpcCheese").value;
    await productCheese(upc, cheeseFactoryId, cheeseFactoryName, 
      rancheeseFactoryInfocherInfo, productNotesCheese, milkUpc).send({from: cheeseFactoryId});
  },

  sellItemButtonCheese: async function() {
    const { sellItem } = this.meta.methods;
    const upc = document.getElementById("cheeseUpc").value;
    const cheeseFactoryId = document.getElementById("cheeseFactoryId").value;
    var productPriceCheese = document.getElementById("productPriceCheese").value;
    productPriceCheese = Web3.utils.toWei(productPriceCheese + "", "wei");
    await sellItem(upc, productPriceCheese).send({from: cheeseFactoryId});
  },

  buyMilkButton: async function() {
    const { buyMilk } = this.meta.methods;
    const upc =  document.getElementById("milkUpcCheese").value;
    const cheeseFactoryId = document.getElementById("cheeseFactoryId").value;
    var productPriceCheese = document.getElementById("productPriceCheese").value;
    await buyMilk(upc).send({from: cheeseFactoryId, value: productPriceCheese});
  },

  buyItemDistributorButton: async function() {
    const { fetchItem2 } = this.meta.methods;
    const { buyItemByDistributor } = this.meta.methods;
    const upc = document.getElementById("upcDistributor").value;
    const id = document.getElementById("distributorIdB").value;
    var result2 = await fetchItem2(upc).call();
    var productPrice = result2[2];
    await buyItemByDistributor(upc).send({from: id, value: productPrice});
  },

  sellItemDistributorButton: async function() {
    const { sellItem } = this.meta.methods;
    const upc = document.getElementById("upcDistributor").value;
    const id = document.getElementById("distributorIdB").value;
    const productPrice = document.getElementById("productPriceDistributor").value;

    await sellItem(upc, productPrice).send({from: id});
  },

  shipItemButton: async function() {
    const { shipItem } = this.meta.methods;
    const upc = document.getElementById("upcDistributor").value;
    const id = document.getElementById("distributorIdB").value;
    await shipItem(upc).send({from: id});
  },

  buyItemRetailerButton: async function() {
    const { fetchItem2 } = this.meta.methods;
    const { buyItem } = this.meta.methods;
    const upc = document.getElementById("upcRetailer").value;
    const id = document.getElementById("retailerIdB").value;
    var result2 = await fetchItem2(upc).call();
    var productPrice = result2[2];
    await buyItem(upc).send({from: id, value: productPrice});
  },

  receiveItemButton: async function() {
    const { receiveItem } = this.meta.methods;
    const upc = document.getElementById("upcRetailer").value;
    const id = document.getElementById("retailerIdB").value;
    await receiveItem(upc).send({from: id});
  },

  sellItemRetailerButton: async function() {
    const { sellItem } = this.meta.methods;
    const upc = document.getElementById("upcRetailer").value;
    const id = document.getElementById("retailerIdB").value;
    const productPrice = document.getElementById("productPriceRetailer").value;

    await sellItem(upc, productPrice).send({from: id});
  },

  purchaseItemButton: async function() {
    const { fetchItem2 } = this.meta.methods;
    const { purchaseItem } = this.meta.methods;
    const upc = document.getElementById("upcConsumer").value;
    const id = document.getElementById("consumerIdB").value;

    var result2 = await fetchItem2(upc).call();
    var productPrice = result2[2];
    await purchaseItem(upc).send({from: id, value: productPrice});
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"),);
  }

  App.start();
});

