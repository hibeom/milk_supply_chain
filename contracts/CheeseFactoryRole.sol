pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'CheeseFactoryRole' to manage this role - add, remove, check
contract CheeseFactoryRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event CheeseFactoryAdded(address indexed account);
  event CheeseFactoryRemoved(address indexed account);

  // Define a struct 'cheesefactories' by inheriting from 'Roles' library, struct Role
  Roles.Role private cheesefactories;

  // In the constructor make the address that deploys this contract the 1st cheesefactory
  constructor() public {
    _addCheeseFactory(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyCheeseFactory() {
    require(isCheeseFactory(msg.sender), "Only cheesefactory can access.");
    _;
  }

  // Define a function 'isCheeseFactory' to check this role
  function isCheeseFactory(address account) public view returns (bool) {
    return cheesefactories.has(account);
  }

  // Define a function 'addCheeseFactory' that adds this role
  function addCheeseFactory(address account) public onlyCheeseFactory {
    _addCheeseFactory(account);
  }

  // Define a function 'renounceCheeseFactory' to renounce this role
  function renounceCheeseFactory() public {
    _removeCheeseFactory(msg.sender);
  }

  // Define an internal function '_addCheeseFactory' to add this role, called by 'addCheeseFactory'
  function _addCheeseFactory(address account) internal {
    cheesefactories.add(account);
    emit CheeseFactoryAdded(account);
  }

  // Define an internal function '_removeCheeseFactory' to remove this role, called by 'removeCheeseFactory'
  function _removeCheeseFactory(address account) internal {
    cheesefactories.remove(account);
    emit CheeseFactoryRemoved(account);
  }
}