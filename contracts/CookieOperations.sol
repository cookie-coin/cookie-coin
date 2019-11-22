pragma solidity >=0.4.23 <0.6.0;

import './SafeMath.sol';

/**
 * @title CookieOperations
 * @dev Operations that can be placed with a CookieMonsters structure
 */
library CookieOperations {

    using SafeMath for uint256;

    uint256 constant private AMOUNT_TO_BE_A_MONSTER = 1000;

    struct MonsterEntry {
        address monsterAddress;
        bool isMonster;
    }

    struct CookieMonsters {
        mapping (address => uint256) monsterRegistry;
        MonsterEntry[] monsterEntries;
        uint256 count;
        uint256 currentIndex;
        MonsterEntry[] cleanedEntries;
    }

    function init(CookieMonsters storage self) internal {
        // set the first entry as a null, cause isMonster would return false with the first entry in monsterEntries otherwise.
        self.monsterEntries.push(MonsterEntry(address(0), false));
    }

    function modify(CookieMonsters storage self, address userAddress, uint256 balance) internal {
        if(!isMonster(self, userAddress) && balance >= AMOUNT_TO_BE_A_MONSTER) {

            uint256 index = self.monsterEntries.push(MonsterEntry(userAddress, true)) - 1;
            self.monsterRegistry[userAddress] = index;
            self.count = self.count.add(1);

        } else if (isMonster(self, userAddress)) {
            uint256 index = self.monsterRegistry[userAddress];
            MonsterEntry storage entry = self.monsterEntries[index];
            bool shouldBeAMonster = balance >= AMOUNT_TO_BE_A_MONSTER;

            if(shouldBeAMonster && entry.isMonster == false) {
                self.count = self.count.add(1);
            } else if (!shouldBeAMonster){
                self.count = self.count.sub(1);
            }
            entry.isMonster = shouldBeAMonster;
        }
    }

    function countMonsters(CookieMonsters storage self) internal view returns(uint256) {
        return self.count;
    }

    function isMonster(CookieMonsters storage self, address userAddress) internal view returns(bool) {
        return self.monsterRegistry[userAddress] != uint256(0);
    }

    function getNextMonsterAddress(CookieMonsters storage self) internal returns(MonsterEntry memory) {
        self.currentIndex = self.currentIndex.add(1);

        if(self.currentIndex >= self.monsterEntries.length) {
            self.currentIndex = uint256(0);
        }
        return self.monsterEntries[self.currentIndex];
    }
}