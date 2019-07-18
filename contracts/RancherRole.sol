pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'RancherRole' to manage this role - add, remove, check
contract RancherRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event RancherAdded(address indexed account);
  event RancherRemoved(address indexed account);

  // Define a struct 'ranchers' by inheriting from 'Roles' library, struct Role
  Roles.Role private ranchers;

  // In the constructor make the address that deploys this contract the 1st rancher
  constructor() public {
    _addRancher(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyRancher() {
    require(isRancher(msg.sender), "Only rancher can access.");
    _;
  }

  // Define a function 'isRancher' to check this role
  function isRancher(address account) public view returns (bool) {
    return ranchers.has(account);
  }

  // Define a function 'addRancher' that adds this role
  function addRancher(address account) public onlyRancher {
    _addRancher(account);
  }

  // Define a function 'renounceRancher' to renounce this role
  function renounceRancher() public {
    _removeRancher(msg.sender);
  }

  // Define an internal function '_addRancher' to add this role, called by 'addRancher'
  function _addRancher(address account) internal {
    ranchers.add(account);
    emit RancherAdded(account);
  }

  // Define an internal function '_removeRancher' to remove this role, called by 'removeRancher'
  function _removeRancher(address account) internal {
    ranchers.remove(account);
    emit RancherRemoved(account);
  }
}