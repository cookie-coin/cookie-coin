pragma solidity >=0.4.23 <0.6.0;

import './SafeMath.sol';
import './BaseCoin.sol';

contract CookieCoin is BaseCoin {

    using SafeMath for uint256;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowed;

    uint256 private _totalSupply;
    address private _ownerAddress;

    constructor(uint256 totalSupply) BaseCoin(totalSupply) public {
    }


    function totalSupply() public view returns (uint256) {
        return super.totalSupply();
    }

    function balanceOf(address owner) public view returns (uint256) {
        return super.balanceOf(owner);
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return super.allowance(owner, spender);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        return super.transfer(to, value);
    }

    function approve(address spender, uint256 value) public returns (bool) {
        super.approve(spender, value);
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        return super.transferFrom(from, to, value);
    }

}