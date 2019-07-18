// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require("SupplyChain");

let instance;
var sku = 1;
var upc = 1;
var cheeseUpc = 2;
var accounts;
var ownerId;
var rancherId;
var rancherName;
var rancherInfo;
var cheeseFactoryId;
var cheeseFactoryName;
var cheeseFactoryInfo;
var productId = sku + upc;
var cheeseId = sku + cheeseUpc;
var productPrice;
var distributorId;
var retailerId;
var consumerId;
var usedMilkUpc;
var productNotesMilk;
var productNotesCheese;
var cheesePrice;

beforeEach(async() => {
    instance = await SupplyChain.deployed();
    await contract('SupplyChain', (accs) => {
        accounts = accs;
        ownerId = accounts[0];
        rancherId = accounts[1];
        rancherName = 'happy rancher';
        rancherInfo = 'cleaning every day';
        productPrice = web3.utils.toWei("1", "ether");
        cheesePrice = web3.utils.toWei("1.1", "ether");
        cheeseFactoryId = accounts[5];
        cheeseFactoryName = 'wonderful cheese';
        cheeseFactoryInfo = 'located in Kangwon';
        distributorId = accounts[2];
        retailerId = accounts[3];
        consumerId = accounts[4];
        usedMilkUpc = 1;
        productNotesMilk = 'fresh milk';
        productNotesCheese = 'fresh cheese';
    });
});


describe('all tests', () => {
    // 1st Test
    it("Testing smart contract function productMilk() that allows a rancher to product milk", async() => {
        //add new Rancher by contract owner
        await instance.addRancher(rancherId, {from: ownerId});
        // Declare and Initialize a variable for event
        //var eventEmitted = false
        
        // Watch the emitted event Producted()
        // var event = supplyChain.Producted()
        // await event.watch((err, res) => {
        //     eventEmitted = true
        // })

        // Mark an item as Producted by calling function productMilk()
        await instance.productMilk(upc, rancherId, rancherName, rancherInfo, productNotesMilk, {from: rancherId});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(upc)
        const result2 = await instance.fetchItem2.call(upc)

        // Verify the result set
        assert.equal(result1[0], sku, 'Error: Invalid item SKU')
        assert.equal(result1[1], upc, 'Error: Invalid item UPC')
        assert.equal(result1[2], 'milk', 'Error: Invalid item type')
        assert.equal(result1[3], rancherId, 'Error: Missing or Invalid rancherID')
        assert.equal(result1[4], rancherId, 'Error: Missing or Invalid productorId')
        assert.equal(result1[5], rancherName, 'Error: Missing or Invalid rancherName')
        assert.equal(result1[6], rancherInfo, 'Error: Missing or Invalid rancherInfo')
        assert.equal(result2[0], productId, 'Error: Invalid productId')
        assert.equal(result2[1], productNotesMilk, 'Error: Invalid productNotes')
        //assert.equal(result2[2], productPrice, 'Error: Invalid productPrice')
        //assert.equal(result2[3], 'Producted', 'Error: Invalid item State')
        assert.equal(result2[3], 0, 'Error: Invalid item State')
        //assert.equal(eventEmitted, true, 'Invalid event emitted')        
    });

    // 2nd Test
    it("Testing smart contract function processItem() that allows a rancher to process milk", async() => {        
        // Mark an item as Processed by calling function processItem()
        await instance.processItem(upc, {from: rancherId});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(upc);
        const result2 = await instance.fetchItem2.call(upc);       

        // Verify the result set
        assert.equal(result1[0], sku, 'Error: Invalid item SKU');
        assert.equal(result1[1], upc, 'Error: Invalid item UPC');
        assert.equal(result1[2], 'milk', 'Error: Invalid item type');
        assert.equal(result1[3], rancherId, 'Error: Missing or Invalid rancherID');
        assert.equal(result1[4], rancherId, 'Error: Missing or Invalid productorId');
        assert.equal(result1[5], rancherName, 'Error: Missing or Invalid rancherName');
        assert.equal(result1[6], rancherInfo, 'Error: Missing or Invalid rancherInfo');
        assert.equal(result2[0], productId, 'Error: Invalid productId');
        assert.equal(result2[1], productNotesMilk, 'Error: Invalid productNotes');
        //assert.equal(result2[3], 'Processed', 'Error: Invalid item State');
        assert.equal(result2[3], 1, 'Error: Invalid item State');
    });

    // 3rd Test
    it("Testing smart contract function sellItem() by rancher", async() => {
        // Mark an item as ForSale by calling function sellItem()
        await instance.sellItem(upc, productPrice, {from: rancherId});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(upc);
        const result2 = await instance.fetchItem2.call(upc);
        // Verify the result set
        assert.equal(result1[0], sku, 'Error: Invalid item SKU');
        assert.equal(result1[1], upc, 'Error: Invalid item UPC');
        assert.equal(result1[2], 'milk', 'Error: Invalid item type');
        assert.equal(result1[3], rancherId, 'Error: Missing or Invalid rancherID');
        assert.equal(result1[4], rancherId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'ForSale', 'Error: Invalid item State');
        assert.equal(result2[3], 2, 'Error: Invalid item State');
        assert.equal(result2[2], productPrice, 'Error: Invalid productPrice')       
    });

    //4th Test
    it('Testing smart contract function buyMilk() by cheesefactory', async() => {
        //add new cheeseFactory by contract owner
        await instance.addCheeseFactory(cheeseFactoryId, {from: ownerId});
        // Mark an milk as Consumed by calling function buyMilk()
        let balance = web3.utils.toWei("2.5", "ether");
        await instance.buyMilk(upc, {from: cheeseFactoryId, value: balance}); 

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(upc);
        const result2 = await instance.fetchItem2.call(upc);
        // Verify the result set
        assert.equal(result1[0], sku, 'Error: Invalid item SKU');
        assert.equal(result1[1], upc, 'Error: Invalid item UPC');
        assert.equal(result1[2], 'milk', 'Error: Invalid item type');
        assert.equal(result1[3], cheeseFactoryId, 'Error: Missing or Invalid ownerId');
        assert.equal(result1[4], rancherId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'Consumed', 'Error: Invalid item State');
        assert.equal(result2[3], 6, 'Error: Invalid item State');
        assert.equal(result2[2], productPrice, 'Error: Invalid productPrice')   
        assert.equal(result2[6], cheeseFactoryId, 'Error: invalid cosumer id');    
    });

    //5th Test
    it('Testing smart contract function productCheese() by cheesefactory', async() => {
        // Mark an milk as Consumed by calling function buyMilk()
        await instance.productCheese(cheeseUpc, cheeseFactoryId, cheeseFactoryName,
            cheeseFactoryInfo, productNotesCheese, upc, {from: cheeseFactoryId}); 
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc);

        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid item SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], cheeseFactoryId, 'Error: Missing or Invalid ownerId');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        assert.equal(result1[5], cheeseFactoryName, 'Error: Missing or Invalid rancherName');
        assert.equal(result1[6], cheeseFactoryInfo, 'Error: Missing or Invalid rancherInfo');
        //assert.equal(result2[3], 'Processed', 'Error: Invalid item State'); 
        assert.equal(result2[3], 1, 'Error: Invalid item State'); 
        assert.equal(result2[7], upc, 'Error: Invalid milk upc');
    });

    //6th Test
    it('Testing smart contract function sellItem() by cheeseFactory', async() => {
        // Mark an item as ForSale by calling function sellItem()
        await instance.sellItem(cheeseUpc, cheesePrice, {from: cheeseFactoryId});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc);
        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid cheese SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], cheeseFactoryId, 'Error: Missing or Invalid owner id');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'ForSale', 'Error: Invalid item State');
        assert.equal(result2[3], 2, 'Error: Invalid item State');
        assert.equal(result2[2], cheesePrice, 'Error: Invalid productPrice')   
    });

    //7th Test
    it('Testing smart contract function buyItemByDistributor() by distributor', async() => {
        //add new distributor by contract owner
        await instance.addDistributor(distributorId, {from: ownerId}); 
        // Mark an item as Sold by calling function buyItemByDistributor()
        let balance = web3.utils.toWei("2.5", "ether");
        await instance.buyItemByDistributor(cheeseUpc, {from: distributorId, value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc); 
        
        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid cheese SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], distributorId, 'Error: Missing or Invalid owner id');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'Sold', 'Error: Invalid item State');
        assert.equal(result2[3], 3, 'Error: Invalid item State');
        assert.equal(result2[2], cheesePrice, 'Error: Invalid productPrice');
        assert.equal(result2[4], distributorId, 'Error: Invalid distributor id'); 
    });

    //8th Test
    it('Testing smart contract function shipItem() by distributor', async() => {
        // Before ship item, mark an item as ForSale
        await instance.sellItem(cheeseUpc, cheesePrice, {from: distributorId});
        // Then ship item
        await instance.shipItem(cheeseUpc, {from: distributorId});
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc); 

        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid cheese SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], distributorId, 'Error: Missing or Invalid owner id');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'Shipped', 'Error: Invalid item State');
        assert.equal(result2[3], 4, 'Error: Invalid item State');
        assert.equal(result2[2], cheesePrice, 'Error: Invalid productPrice');
        assert.equal(result2[4], distributorId, 'Error: Invalid distributor id'); 
    });

    //9th Test
    it('Testing smart contract function receiveItem() by retailer', async() => {
        // Add new retailer by contract owner
        await instance.addRetailer(retailerId, {from: ownerId});
        // Mark an item as Received by calling function receiveItem()
        await instance.receiveItem(cheeseUpc, {from: retailerId});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc); 

        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid cheese SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], retailerId, 'Error: Missing or Invalid owner id');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'Received', 'Error: Invalid item State');
        assert.equal(result2[3], 5, 'Error: Invalid item State');
        assert.equal(result2[2], cheesePrice, 'Error: Invalid productPrice');
        assert.equal(result2[4], distributorId, 'Error: Invalid distributor id');
        assert.equal(result2[5], retailerId, 'Error: Invalid retailer id');
    });

    //10th Test
    it('Testing smart contract function purchaseItem() by consumer', async() => {
        // Add new consumer by contract owner
        await instance.addConsumer(consumerId, {from: ownerId});
        // Before purchase item, mark an item as ForSale
        await instance.sellItem(cheeseUpc, cheesePrice, {from: retailerId});
        // Mark an item as Consumed by calling function purchaseItem()
        let balance = web3.utils.toWei("2.5", "ether");
        await instance.purchaseItem(cheeseUpc, {from: consumerId, value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const result1 = await instance.fetchItem1.call(cheeseUpc);
        const result2 = await instance.fetchItem2.call(cheeseUpc); 

        // Verify the result set
        assert.equal(result1[0], 2, 'Error: Invalid cheese SKU');
        assert.equal(result1[1], cheeseUpc, 'Error: Invalid cheese UPC');
        assert.equal(result1[2], 'cheese', 'Error: Invalid item type');
        assert.equal(result1[3], consumerId, 'Error: Missing or Invalid owner id');
        assert.equal(result1[4], cheeseFactoryId, 'Error: Missing or Invalid productorId');
        //assert.equal(result2[3], 'Consumed', 'Error: Invalid item State');
        assert.equal(result2[3], 6, 'Error: Invalid item State');
        assert.equal(result2[2], cheesePrice, 'Error: Invalid productPrice');
        assert.equal(result2[4], distributorId, 'Error: Invalid distributor id');
        assert.equal(result2[5], retailerId, 'Error: Invalid retailer id');
        assert.equal(result2[6], consumerId, 'Error: Invalid consumer id');
        assert.equal(result2[7], upc, 'Error: Invalid usedMilk UPC');
    });
});

