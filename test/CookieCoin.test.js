const assert = require("assert");

const CookieCoin = artifacts.require("./CookieCoin.sol");

contract("CookieCoin", (accounts) => {
    const totalSupply = 1000000000;
    const owner = tronWeb.address.toHex(accounts[0]);
    const otherDude = tronWeb.address.toHex(accounts[1]);
    const thirdDude = tronWeb.address.toHex(accounts[2]);
    const fourthDude = tronWeb.address.toHex(accounts[3]);
    const fifthDude = tronWeb.address.toHex(accounts[4]);
    const sixthDude = tronWeb.address.toHex(accounts[5]);
    const seventhDude = tronWeb.address.toHex(accounts[6]);
    const eighthDude = tronWeb.address.toHex(accounts[7]);


    let cookie;

    before(async function () {
        cookie = await CookieCoin.deployed()
        assert.ok(cookie);
    })

    it("totalSupply should return correct total amount", async() => {
        const result = await cookie.call('totalSupply');
        assert.ok(result);
        assert.equal(result, totalSupply);
    });

    it("balanceOf owner should have everything", async() => {
        const result = await cookie.call('balanceOf', owner);
        assert.ok(result);
        assert.equal(result, totalSupply);
    });

    it("balanceOf someone who didn't use cookies before, should have zero", async() => {
        const result = await cookie.call('balanceOf', otherDude);
        assert.ok(result);
        assert.equal(result, 0);
    }); 

    it("allowance set allowance below minimum amount and verify its not set", async() => {
        let result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 0);
        
        const allowance = await cookie.call('approve', otherDude, 99);

        result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 0);
    });

    it("allowance set allowance and check if the value is correct", async() => {
        let result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 0);
        
        const allowance = await cookie.call('approve', otherDude, 100);

        result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 100);
    });

   
    it("approve allowance and the spenders try to spend more than he's allowed to, do nothing", async() => {
        // create and check allowance
        const createAllowance = await cookie.call('approve', otherDude, 100);
        const checkAllowance = await cookie.call('allowance', owner, otherDude);
        assert.ok(checkAllowance);
        assert.equal(checkAllowance, 100);
       
        // the otherDude transferes the allowed amount from the owner to the thirdDude
        const result = await cookie.call('transferFrom', owner, thirdDude, 101, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(result);

        // check that the allowance is still the same
        result2 = await cookie.call('allowance', owner, otherDude);
        assert.ok(result2);
        assert.equal(result2, 100);

        // check the outcome balance is unchanged
        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply);
        const thirdDudeNewBalance = await cookie.call('balanceOf', thirdDude);
        assert.ok(thirdDudeNewBalance);
        assert.equal(thirdDudeNewBalance, 0);

        // verify that nothings minted and added to the cookie jar
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, totalSupply);
    });

    it("approve allowance and the spenders try to spend less than the minimum amount, do nothing", async() => {
        // create and check allowance
        const createAllowance = await cookie.call('approve', otherDude, 100);
        const checkAllowance = await cookie.call('allowance', owner, otherDude);
        assert.ok(checkAllowance);
        assert.equal(checkAllowance, 100);
       
        // the otherDude transferes the allowed amount from the owner to the thirdDude
        const result = await cookie.call('transferFrom', owner, thirdDude, 99, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(result);

        // check that the allowance is still the same
        result2 = await cookie.call('allowance', owner, otherDude);
        assert.ok(result2);
        assert.equal(result2, 100);

        // check the outcome balance is unchanged
        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply);
        const thirdDudeNewBalance = await cookie.call('balanceOf', thirdDude);
        assert.ok(thirdDudeNewBalance);
        assert.equal(thirdDudeNewBalance, 0);

         // verify that nothings minted and added to the cookie jar
         const newTotalSupply = await cookie.call('totalSupply');
         assert.ok(newTotalSupply);
         assert.equal(newTotalSupply, totalSupply);
    });

    it("approve allowance and let the spender use it to the max, should work", async() => {
        // create and check allowance
        const createAllowance = await cookie.call('approve', otherDude, 100);
        const checkAllowance = await cookie.call('allowance', owner, otherDude);
        assert.ok(checkAllowance);
        assert.equal(checkAllowance, 100);
       
        // the otherDude transferes the allowed amount from the owner to the thirdDude
        const result = await cookie.call('transferFrom', owner, thirdDude, 100, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(result);

        // check that the allowance is used up and is zero
        result2 = await cookie.call('allowance', owner, otherDude);
        assert.ok(result2);
        assert.equal(result2, 0);

        // check the outcome balance of the owner and the recipient, thirdDude
        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        // owner has now 100 coins deducted but got one since he is a cookieMonster and 1 cookies is the 1% that was minted
        assert.equal(newOwnerBalance, totalSupply - 100 + 1);
        const thirdDudeNewBalance = await cookie.call('balanceOf', thirdDude);
        assert.ok(thirdDudeNewBalance);
        assert.equal(thirdDudeNewBalance, 100);

        // verify that 1% is minted and added into the cookie jar
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, totalSupply + 1);

        // third dude gives back the money, so that the other tests can succeed
        const thirdDudeGivesMoneyBack = await cookie.call('transfer', owner, 100, {from: tronWeb.address.fromHex(thirdDude)});
    });

    
    it("transfer from owner to otherDude more than the owner has, should do nothing", async() => {
        const result = await cookie.call('transfer', otherDude, totalSupply + 1);
        assert.ok(result);
        
        const otherDudeNewBalance = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance);
        assert.equal(otherDudeNewBalance, 0);

        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply + 2);
       
        // verify that nothing extra is minted since transaction failed
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, totalSupply + 2);
    });

    it("transfer from owner to otherDude less than the minimum amount, should do nothing", async() => {
        const result = await cookie.call('transfer', otherDude, 99);
        assert.ok(result);
        
        const otherDudeNewBalance = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance);
        assert.equal(otherDudeNewBalance, 0);

        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply + 2);

        // verify that nothing extra is minted since transaction failed
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, totalSupply + 2);
    });

        
    it("transfer from owner to otherDude, should deduct from owner and add to otherDude", async() => {
        const result = await cookie.call('transfer', otherDude, 100);
        assert.ok(result);
        
        const otherDudeNewBalance = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance);
        assert.equal(otherDudeNewBalance, 100);

        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply - 100 + 3);
        
        // verify that 1% is minted and added into the cookie jar
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, totalSupply + 3);
    }); 

    it("check monster-count variations with transactions, should add above balance 1000, remove below and add again above it.", async() => {
        //1. initial monster count only the owner, since he's the only one with a balance > 1000
        const initialMonsters = await cookie.call('cookieMonsterCount');
        assert.ok(initialMonsters);
        assert.equal(initialMonsters, 1);
        
        //2. add funds to otherDude so that he can become a cookie-monster
        const sendsFundsToOtherDude1 = await cookie.call('transfer', otherDude, 900);
        assert.ok(sendsFundsToOtherDude1);
        

        //3. check cookie monster count to verify now the owner and the otherDude are both cookie-monsters
        const monstersAfterFirstHighEnoughTransaction = await cookie.call('cookieMonsterCount');
        assert.ok(monstersAfterFirstHighEnoughTransaction);
        assert.equal(monstersAfterFirstHighEnoughTransaction,2);

        //4. deduct 100 cookies from otherDude, he's no cookie-monster anymore after that
        const otherDudeTransaction = await cookie.call('transfer', owner, 100, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(otherDudeTransaction);

        //5. cookie-monster count should be back to 1, since otherDude has not enough funds in his balance
        const monstersAfterReduction = await cookie.call('cookieMonsterCount');
        assert.ok(monstersAfterReduction);
        assert.equal(monstersAfterReduction, 1);

        //6. add more funds to otherDude so that he can become a cookie-monster again
        const sendsFundsToOtherDude2 = await cookie.call('transfer', otherDude, 100);
        assert.ok(sendsFundsToOtherDude2);

        //7. cookie-monster count should be 2 since now otherDude has become a cookie-monster again with funds of 1000 cookies
        const monstersAfterSecondAddition = await cookie.call('cookieMonsterCount');
        assert.ok(monstersAfterSecondAddition);
        assert.equal(monstersAfterSecondAddition, 2);

        const sendBackCookies = await cookie.call('transfer', owner, 1000, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(sendBackCookies);
    });


    it("check shared cookies added to cookie-monsters for transactions. should share equally", async() => {       
        const ownerBalanceBefore = await cookie.call('balanceOf', owner);
        const otherDudeBalanceBefore = await cookie.call('balanceOf', otherDude);
        assert.equal(otherDudeBalanceBefore, 6);
        
        //1. add funds to otherDude so that he can become a cookie-monster
        const sendsFundsToOtherDude1 = await cookie.call('transfer', otherDude, 900);
        assert.ok(sendsFundsToOtherDude1);

        // owner should get 9 shared cookies of his own transaction since he's the only monster.
        const ownerNewBalance1 = await cookie.call('balanceOf', owner);
        assert.ok(ownerNewBalance1);
        assert.equal(ownerNewBalance1, ownerBalanceBefore - 900 + 9);
        
        //2. owner transacts 400 to third dude
        const sendFundsToThirdDude = await cookie.call('transfer', otherDude, 400);
        assert.ok(sendFundsToThirdDude);

        // owner should get 2 shared cookies out of fromer transaction and otherDude now as well 2 cookies.
        const ownerNewBalance2 = await cookie.call('balanceOf', owner);
        assert.ok(ownerNewBalance2);
        assert.equal(ownerNewBalance2, ownerNewBalance1 - 400 + 2);
        const otherDudeNewBalance1 = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance1);
        assert.equal(otherDudeNewBalance1, 1308);

        //4. deduct 400 cookies from otherDude, he's no cookie-monster anymore after that.
        const otherDudeTransaction = await cookie.call('transfer', thirdDude, 400, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(otherDudeTransaction);

        // owner should get 4 shared cookies out of fromer transaction and otherDude none since he's no more cookie-monster.
        const ownerNewBalance3 = await cookie.call('balanceOf', owner);
        assert.ok(ownerNewBalance3);
        assert.equal(ownerNewBalance3, ownerNewBalance1 - 400 + 2 + 4);
        const otherDudeNewBalance2 = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance2);
        assert.equal(otherDudeNewBalance2, 908);
    });

    it("check shared cookies added to many cookie-monsters many transactions. should share equally", async() => {       
        const ownerBalanceBefore = 999998733;
        const totalbalanceBefore = 1000000041;

        //1. add funds to others so that they become a cookie-monsters
        const sendsFundsToOtherDude1 = await cookie.call('transfer', fourthDude, 1000);
        assert.ok(sendsFundsToOtherDude1);
        const sendsFundsToOtherDude2 = await cookie.call('transfer', fifthDude, 1000);
        assert.ok(sendsFundsToOtherDude2);
        const sendsFundsToOtherDude3 = await cookie.call('transfer', sixthDude, 1000);
        assert.ok(sendsFundsToOtherDude3);
        const sendsFundsToOtherDude4 = await cookie.call('transfer', seventhDude, 1000);
        assert.ok(sendsFundsToOtherDude4);
        const sendsFundsToOtherDude5 = await cookie.call('transfer', eighthDude, 1000);
        assert.ok(sendsFundsToOtherDude5);

        // verify that 50 new cookies have been minted
        const newTotalSupply = await cookie.call('totalSupply');
        assert.ok(newTotalSupply);
        assert.equal(newTotalSupply, (totalbalanceBefore + 50));

        const ownerNewBalance1 = await cookie.call('balanceOf', owner);
        assert.ok(ownerNewBalance1);
        assert.equal(ownerNewBalance1, (ownerBalanceBefore - 5000 + 5 + 3 + 2 + 2 + 2));

        const otherDudeNewBalance1 = await cookie.call('balanceOf', fourthDude);
        assert.ok(otherDudeNewBalance1);
        assert.equal(otherDudeNewBalance1, (1000 + 5  + 4  + 2 + 2 + 2));
        const otherDudeNewBalance2 = await cookie.call('balanceOf', fifthDude);
        assert.ok(otherDudeNewBalance2);
        assert.equal(otherDudeNewBalance2, (1000 + 3 + 3 + 2 + 1));
        const otherDudeNewBalance3 = await cookie.call('balanceOf', sixthDude);
        assert.ok(otherDudeNewBalance3);
        assert.equal(otherDudeNewBalance3, (1000 + 3 + 2 + 1));
        const otherDudeNewBalance4 = await cookie.call('balanceOf', seventhDude);
        assert.ok(otherDudeNewBalance4);
        assert.equal(otherDudeNewBalance4, (1000 + 2 + 2));
        const otherDudeNewBalance5 = await cookie.call('balanceOf', eighthDude);
        assert.ok(otherDudeNewBalance5);
        assert.equal(otherDudeNewBalance5, (1000 + 2));
    });



    it("the owner mints new coins, should increase its balance and the totalSupply", async() => {
        const mintedAmount = 5000;

        const mintCoins = await cookie.call('mint', mintedAmount);
        assert.ok(mintCoins);

        const ownerBalanceAfter = await cookie.call('balanceOf', owner);
        assert.ok(ownerBalanceAfter);
        assert.equal(ownerBalanceAfter, 999998747);

        const totalSupplyAfter = await cookie.call('totalSupply');
        assert.ok(totalSupplyAfter);
        assert.equal(totalSupplyAfter, 1000005091);
    });

    
    it("someone else tries to mint new coins, should do nothing", async() => {
        const balanceBefore = await cookie.call('balanceOf', otherDude);
        assert.ok(balanceBefore);
        const totalSupplyBefore = await cookie.call('totalSupply');
        assert.ok(totalSupplyBefore);

        const mintedAmount = 5000;

        const mintCoins = await cookie.call('mint', mintedAmount, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(mintCoins);

        const balanceAfter = await cookie.call('balanceOf', otherDude);
        assert.ok(balanceAfter);
        assert.deepEqual(balanceAfter, balanceBefore);

        const totalSupplyAfter = await cookie.call('totalSupply');
        assert.ok(totalSupplyAfter);
        assert.deepEqual(totalSupplyAfter, totalSupplyBefore);
    });


    it("the owner burns new coins, should increase its balance and the totalSupply", async() => {
        const burnAmount = 5000;

        const burnCoins = await cookie.call('burn', burnAmount);
        assert.ok(burnCoins);

        const ownerBalanceAfter = await cookie.call('balanceOf', owner);
        assert.ok(ownerBalanceAfter);
        assert.equal(ownerBalanceAfter, 999993747);

        const totalSupplyAfter = await cookie.call('totalSupply');
        assert.ok(totalSupplyAfter);
        assert.equal(totalSupplyAfter, 1000000091);
    });

    it("someone else tries to burn coins, should do nothing", async() => {
        const balanceBefore = await cookie.call('balanceOf', otherDude);
        assert.ok(balanceBefore);
        const totalSupplyBefore = await cookie.call('totalSupply');
        assert.ok(totalSupplyBefore);

        const burnAmount = 5000;

        const burnCoins = await cookie.call('burn', burnAmount, {from: tronWeb.address.fromHex(otherDude)});
        assert.ok(burnCoins);

        const balanceAfter = await cookie.call('balanceOf', otherDude);
        assert.ok(balanceAfter);
        assert.deepEqual(balanceAfter, balanceBefore);

        const totalSupplyAfter = await cookie.call('totalSupply');
        assert.ok(totalSupplyAfter);
        assert.deepEqual(totalSupplyAfter, totalSupplyBefore);
    });

    it("name should return correct name of the CookieCoin", async() => {
        const result = await cookie.call('name');
        assert.ok(result);
        assert.equal(result, 'CookieCoin');
    });

    it("symbol should return correct symbol of the CookieCoin", async() => {
        const result = await cookie.call('symbol');
        assert.ok(result);
        assert.equal(result, 'COOKIE');
    });

    it("decimals should return correct decimals of the CookieCoin", async() => {
        const result = await cookie.call('decimals');
        assert.equal(result, 0);
    });
});