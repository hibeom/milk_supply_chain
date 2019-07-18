pragma solidity >=0.4.24;

import "./Ownable.sol";
import "./RancherRole.sol";
import "./CheeseFactoryRole.sol";
import "./DistributorRole.sol";
import "./RetailerRole.sol";
import "./ConsumerRole.sol";

//Define a contract "SupplyChain"
contract SupplyChain is Ownable, RancherRole, CheeseFactoryRole, DistributorRole, RetailerRole, ConsumerRole {
    // Define 'owner'
    address owner;
    // Define a variable called 'upc' for Universal Product Code (UPC)
    uint  upc;
    // Define a variable called 'sku' for Stock Keeping Unit (SKU)
    uint  sku;
    // Define a public mapping 'items' that maps the UPC to an Item.
    mapping (uint => Item) items;

    // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash,
    // that track its journey through the supply chain -- to be sent from DApp.
    mapping (uint => string[]) itemsHistory;

    // Define enum 'State' with the following values:
    enum State {
        Producted, //0
        Processed, //1
        ForSale, //2
        Sold, //3
        Shipped, //4
        Received, //5
        Consumed //6
    }

    enum Type {
        Milk, //0
        Cheese //1
    }

    State constant defaultState = State.Producted;

    //Define a struct 'Item' with the following fields:
    struct Item {
        uint sku;
        uint upc;
        Type itemType;
        address ownerId;
        address productorId; //productor who products milk or cheese
        string productorName;
        string productorInfo;
        uint productId; //productId potentially a combination of upc + sku
        string productNotes;
        uint productPrice;
        State itemState;
        address distributorId;
        address retailerId;
        address consumerId; //consumber can be cheeseFactory
        uint usedMilkUpc; // if item is cheese, then user can track used milk information by milkUpc
    }

    // Define 8 events with the same 8 state values and accept 'upc' as input argument
    event Producted(uint upc);
    event Processed(uint upc);
    event ForSale(uint upc);
    event Sold(uint upc);
    event Shipped(uint upc);
    event Received(uint upc);
    event Consumed(uint upc);

    // Define a modifer that checks to see if msg.sender == owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can access.");
        _;
    }

    // Define a modifer that verifies the Caller
    modifier verifyCaller (address _address) {
        require(msg.sender == _address, "Wrong caller.");
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier paidEnough(uint _price) {
        require(msg.value >= _price, "Paid is not enough.");
        _;
    }

    // Define a modifier that checks the price and refunds the remaining balance
    modifier checkValue(uint _upc) {
        _;
        uint _price = items[_upc].productPrice;
        uint amountToReturn = msg.value - _price;
        if(amountToReturn > 0){
            msg.sender.transfer(amountToReturn);
        }

    }

    // Define a modifier that checks if an item.state of a upc is Producted
    modifier producted(uint _upc) {
        require(items[_upc].itemState == State.Producted, "Product is not producted yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Processed
    modifier processed(uint _upc) {
        require(items[_upc].itemState == State.Processed, "Product is not processed yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is ForSale
    modifier forSale(uint _upc) {
        require(items[_upc].itemState == State.ForSale, "Product is not for sale yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Sold
    modifier sold(uint _upc) {
        require(items[_upc].itemState == State.Sold, "Product is not sold yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Shipped
    modifier shipped(uint _upc) {
        require(items[_upc].itemState == State.Shipped, "Product is not shipped yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Received
    modifier received(uint _upc) {
        require(items[_upc].itemState == State.Received, "Product is not received yet.");
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Received
    modifier consumed(uint _upc) {
        require(items[_upc].itemState == State.Consumed, "Product is not consumed yet.");
        _;
    }

    // In the constructor set 'owner' to the address that instantiated the contract
    // and set 'sku' to 1
    // and set 'upc' to 1
    constructor() public payable {
        owner = msg.sender;
        sku = 0;
        upc = 1;
    }

    // Define a function 'kill' if required
    function kill() public {
        address payable wallet = address(uint160(owner));
        if (msg.sender == owner) {
            selfdestruct(wallet);
        }
    }

    // Define a function 'productMilk' that allows rancher to mark an item 'Producted'
    function productMilk(uint _upc, address _productorId, string memory _productorName,
     string memory _productorInformation, string memory _productNotes) public onlyRancher {
        // Add the new item as part of Product
        Item memory newItem;
        newItem.upc = _upc;
        newItem.itemType = Type.Milk;
        newItem.ownerId = _productorId;
        newItem.productorId = _productorId;
        newItem.productorName = _productorName;
        newItem.productorInfo = _productorInformation;
        newItem.productNotes = _productNotes;
        newItem.itemState = defaultState;

        // Increment sku
        sku = sku + 1;
        newItem.sku = sku;
        newItem.productId = _upc + sku;
        // Push producted item into the items map
        items[_upc] = newItem;
        // Emit the appropriate event
        emit Producted(_upc);
    }

    // Define a function 'productCheese' that allows cheeseFactory to mark an item 'Producted'
    function productCheese(uint _upc, address _productorId, string memory _productorName,
     string memory _productorInformation, string memory _productNotes, uint _usedMilkUpc) public
     onlyCheeseFactory consumed(_usedMilkUpc) {
        // Add the new item as part of Product
        Item memory newItem;
        newItem.upc = _upc;
        newItem.itemType = Type.Cheese;
        newItem.ownerId = _productorId;
        newItem.productorId = _productorId;
        newItem.productorName = _productorName;
        newItem.productorInfo = _productorInformation;
        newItem.productNotes = _productNotes;
        newItem.itemState = State.Processed; //In case of cheese, omit producted state
        newItem.usedMilkUpc = _usedMilkUpc; //cheese's milk source

        // Increment sku
        sku = sku + 1;
        newItem.sku = sku;
        newItem.productId = _upc + sku;
        // Push producted item into the items map
        items[_upc] = newItem;
        // Emit the appropriate event
        emit Producted(_upc);
    }
    // Define a function 'processtItem' that allows a rancher to mark an item 'Processed'
    // Call modifier to check if upc has passed previous supply chain stage
    // Call modifier to verify caller of this function
    function processItem(uint _upc) public producted(_upc) onlyRancher verifyCaller(msg.sender) {
        // Update the appropriate fields
        items[_upc].itemState = State.Processed;
        // Emit the appropriate event
        emit Processed(_upc);
    }

    // Define a function 'sellItem' that allows a productor(rancher, cheeseFactory) to mark an item 'ForSale'
    // Call modifier to verify caller of this function
    function sellItem(uint _upc, uint _price) public verifyCaller(msg.sender) {
        // Update the appropriate fields
        items[_upc].itemState = State.ForSale;
        items[_upc].productPrice = _price;
        // Emit the appropriate event
        emit ForSale(_upc);
    }

    // Define a function 'buyMilk' that allows the cheeseFactory to mark an item 'Sold'
    // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough,
    // and any excess ether sent is refunded back to the buyer
    // Call modifier to check if upc has passed previous supply chain stage
    // Call modifer to check if buyer has paid enough
    // Call modifer to send any excess ether back to buyer
    function buyMilk(uint _upc) public payable forSale(_upc) verifyCaller(msg.sender)
    paidEnough(items[_upc].productPrice) checkValue(_upc) onlyCheeseFactory {
        // Update the appropriate fields - ownerID, itemState
        items[_upc].itemState = State.Consumed;
        // Transfer money to rancher
        address payable wallet = address(uint160(items[_upc].ownerId));
        wallet.transfer(items[_upc].productPrice);
        items[_upc].ownerId = msg.sender;
        items[_upc].consumerId = msg.sender;
        // emit the appropriate event
        emit Consumed(_upc);
    }

    // Define a function 'buyItemByDistributor' that allows the distributor to mark an item 'Sold'
    // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough,
    // and any excess ether sent is refunded back to the buyer
    // Call modifier to check if upc has passed previous supply chain stage
    // Call modifer to check if buyer has paid enough
    // Call modifer to send any excess ether back to buyer
    function buyItemByDistributor(uint _upc) public payable forSale(_upc) verifyCaller(msg.sender)
    paidEnough(items[_upc].productPrice) checkValue(_upc) onlyDistributor {
        // Update itemState, distributorId
        items[_upc].itemState = State.Sold;
        items[_upc].distributorId = msg.sender;
        // Transfer money to rancher
        address payable wallet = address(uint160(items[_upc].ownerId));
        wallet.transfer(items[_upc].productPrice);
        // Update ownerId
        items[_upc].ownerId = msg.sender;
        // emit the appropriate event
        emit Sold(_upc);
    }

    // Define a function 'buyItemBy' that allows the retailer to mark an item 'Sold'
    // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough,
    // and any excess ether sent is refunded back to the buyer
    // Call modifier to check if upc has passed previous supply chain stage
    // Call modifer to check if buyer has paid enough
    // Call modifer to send any excess ether back to buyer
    function buyItem(uint _upc) public payable received(_upc) verifyCaller(msg.sender)
    paidEnough(items[_upc].productPrice) checkValue(_upc) onlyRetailer {
        // Update itemState
        items[_upc].itemState = State.Sold;
        // Transfer money to distributor
        address payable wallet = address(uint160(items[_upc].ownerId));
        wallet.transfer(items[_upc].productPrice);
        // Update ownerId
        items[_upc].ownerId = msg.sender;
        // emit the appropriate event
        emit Sold(_upc);
    }

    // Define a function 'shipItem' that allows the distributor to mark an item 'Shipped'
    // Use the above modifers to check if the item is sold
    // Call modifier to check if upc has passed previous supply chain stage
    // Call modifier to verify caller of this function
    function shipItem(uint _upc) public forSale(_upc) verifyCaller(msg.sender) onlyDistributor {
        // Update the appropriate fields
        items[_upc].itemState = State.Shipped;
        // Emit the appropriate event
        emit Shipped(_upc);
    }
    // Define a function 'receiveItem' that allows the retailer to mark an item 'Received'
    // Use the above modifiers to check if the item is shipped
    // Call modifier to check if upc has passed previous supply chain stage
    function receiveItem(uint _upc) public shipped(_upc) onlyRetailer verifyCaller(msg.sender) {
        // Update the appropriate fields - ownerID, retailerID, itemState
        items[_upc].itemState = State.Received;
        items[_upc].ownerId = msg.sender;
        items[_upc].retailerId = msg.sender;
        // Emit the appropriate event
        emit Received(_upc);
    }

    // Define a function 'purchaseItem' that allows the consumer to mark an item 'Purchased'
    // Use the above modifiers to check if the item is received
    // Call modifier to check if upc has passed previous supply chain stage
    function purchaseItem(uint _upc) public payable onlyConsumer forSale(_upc) verifyCaller(msg.sender)
    paidEnough(items[_upc].productPrice) checkValue(_upc) {
        // Update the appropriate fields - ownerID, consumerID, itemState
        items[_upc].consumerId = msg.sender;
        items[_upc].itemState = State.Consumed;
        // Transfer money to rancher
        address payable wallet = address(uint160(items[_upc].ownerId));
        wallet.transfer(items[_upc].productPrice);
        items[_upc].ownerId = msg.sender;
        // Emit the appropriate event
        emit Consumed(_upc);
    }

    // Define a function 'fetchItem1' that show the all product information
    function fetchItem1(uint _upc) public view returns (
        uint itemSku, uint itemUpc, string memory itemType, address ownerId, address productorId,
        string memory productorName, string memory productorInfo
    ) {
        require(items[_upc].sku > 0, "Product doesn't exist.");
        itemSku = items[_upc].sku;
        itemUpc = items[_upc].upc;
        if(items[_upc].itemType == Type.Milk){
            itemType = "milk";
        } else {
            itemType = "cheese";
        }
        ownerId = items[_upc].ownerId;
        productorId = items[_upc].productorId;
        productorName = items[_upc].productorName;
        productorInfo = items[_upc].productorInfo;
        return (
            itemSku, itemUpc, itemType, ownerId, productorId, productorName, productorInfo
        );
    }

    // Define a function 'fetchItem2' that show the all product information
    function fetchItem2(uint _upc) public view returns (
        uint productId, string memory productNotes,
        uint productPrice, State itemState, address distributorId, address retailerId,
        address consumerId, uint usedMilkUpc
    ) {
        require(items[_upc].sku != 0, "Product doesn't exist.");
        productId = items[_upc].productId;
        productNotes = items[_upc].productNotes;
        productPrice = items[_upc].productPrice;
        /*if(items[_upc].itemState == State.Producted){
            itemState = "Producted";
        } else if(items[_upc].itemState == State.Processed){
            itemState = "Processed";
        } else if (items[_upc].itemState == State.Received){
            itemState = "Received";
        } else if (items[_upc].itemState == State.Consumed){
            itemState = "Consumed";
        } else if (items[_upc].itemState == State.ForSale){
            itemState = "ForSale";
        } else if (items[_upc].itemState == State.Sold) {
            itemState = "Sold";
        } else if (items[_upc].itemState == State.Shipped) {
            itemState = "Shipped";
        }*/
        itemState = items[_upc].itemState;
        distributorId = items[_upc].distributorId;
        retailerId = items[_upc].retailerId;
        consumerId = items[_upc].consumerId;
        usedMilkUpc = items[_upc].usedMilkUpc;

        return (
            productId, productNotes, productPrice, itemState, distributorId, retailerId,
            consumerId, usedMilkUpc
        );
    }
}