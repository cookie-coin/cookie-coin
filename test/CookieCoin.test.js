const assert = require("assert");

const CookieCoin = artifacts.require("./CookieCoin.sol");

contract("CookieCoin", (accounts) => {
    const totalSupply = 1000000000;
    const owner = tronWeb.address.toHex(accounts[0]);
    const otherDude = tronWeb.address.toHex(accounts[1]);
    const thirdDude = tronWeb.address.toHex(accounts[2]);

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

    it("allowance set allowance and check if the value is correct", async() => {
        let result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 0);
        
        const allowance = await cookie.call('approve', otherDude, 100);

        result = await cookie.call('allowance', owner, otherDude);
        assert.ok(result);
        assert.equal(result, 100);
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
        assert.equal(newOwnerBalance, totalSupply - 100);
        const thirdDudeNewBalance = await cookie.call('balanceOf', thirdDude);
        assert.ok(thirdDudeNewBalance);
        assert.equal(thirdDudeNewBalance, 100);

        // third dude gives back the money, so that the other tests can succeed
        const thirdDudeGivesMoneyBack = await cookie.call('transfer', owner, 100, {from: tronWeb.address.fromHex(thirdDude)});
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
    });

    it("transfer from owner to otherDude more than the owner has, should do nothing", async() => {
        const result = await cookie.call('transfer', otherDude, totalSupply + 1);
        assert.ok(result);
        
        const otherDudeNewBalance = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance);
        assert.equal(otherDudeNewBalance, 0);

        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply);
    });

        
    it("transfer from owner to otherDude, should deduct from owner and add to otherDude", async() => {
        const result = await cookie.call('transfer', otherDude, 100);
        assert.ok(result);
        
        const otherDudeNewBalance = await cookie.call('balanceOf', otherDude);
        assert.ok(otherDudeNewBalance);
        assert.equal(otherDudeNewBalance, 100);

        const newOwnerBalance = await cookie.call('balanceOf', owner);
        assert.ok(newOwnerBalance);
        assert.equal(newOwnerBalance, totalSupply - 100);
    }); 

   

});