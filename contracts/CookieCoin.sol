pragma solidity >=0.4.23 <0.6.0;

import './SafeMath.sol';
import './CookieOperations.sol';
import './BaseCoin.sol';

contract CookieCoin is BaseCoin {

    using SafeMath for uint256;
    using CookieOperations for CookieOperations.CookieMonsters;

    CookieOperations.CookieMonsters private cookieMonsters;

    uint256 constant MINIMUM_TRANSACTION_VALUE = 100;


    constructor(uint256 totalSupply) BaseCoin(totalSupply) public {
        cookieMonsters.init();
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

    function approve(
        address spender,
        uint256 value
    )
    public validateMinTransaction(value)
    returns (bool) {
        super.approve(spender, value);
    }


    function _transfer(
        address from,
        address to,
        uint256 value
    )
    internal validateMinTransaction(value) {
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);

        cookieMonsters.modify(from, _balances[from]);
        cookieMonsters.modify(to, _balances[to]);
        _shareCookies(value);

        emit Transfer(from, to, value);
    }

    function _shareCookies(uint256 value) internal {
        uint256 cookiesToMint = value.div(MINIMUM_TRANSACTION_VALUE);

        for (uint256 cookieCount = cookiesToMint; cookieCount > 0;) {
            CookieOperations.MonsterEntry memory entry = cookieMonsters.getNextMonsterAddress();

            if(entry.isMonster) {
                _mint(entry.monsterAddress, 1);
                cookieCount--;
            }
        }
    }

    modifier validateMinTransaction(uint256 value) {
        require(
            value >= MINIMUM_TRANSACTION_VALUE,
            "Transaction value must be at least 100 cookies!"
            );
        _;
    }

    function cookieMonsterCount() public view returns (uint256) {
        return cookieMonsters.countMonsters();
    }

}