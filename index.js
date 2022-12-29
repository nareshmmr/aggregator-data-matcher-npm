const axios = require('axios');
const config = require('./config');
const constants = require('./constants');

 
//sample input data
// const from_symbol = 'XDC';
// const to_symbol = 'USDT';
//const providers = [constants.BITTRUE, constants.KUCOIN, constants.TL_CRYPTO_COMPARE];
// const providers = [{provider:constants.BITTRUE,apikey:"XXXXXXXXXXXXXXXXXXXXXXXXXX"},
//                    {provider:constants.KUCOIN,apikey:"XXXXXXXXXXXXXXXXXXXXXXXXXX"},
//                    {provider:constants.TL_CRYPTO_COMPARE,apikey:"XXXXXXXXXXXXXXXXXXXXXXXXXX"},
//                   ]

module.exports.validatePriceFeedData = async function(from_symbol,to_symbol,providers) {
    // Test Data 
    // let prices = [{provider:"a",price:-1},{provider:"b",price:1.05},{provider:"c",price:1.04},{provider:"d",price:1.01},{provider:"e",price:-2},{provider:"f",price:2000}];
    // let {output_prices,isOutOfRange} = validatePrices(prices);
    const feed_source_config = config.buildFeedSourceConfig(from_symbol,to_symbol,providers);
    try {
        var allResponses = await feed_source_config.map(async config => {
            let resp = await axios(config);
            return resp;
        })
        const responses = await Promise.all(allResponses)
        let prices = fetchPriceFromResponses(responses);
        let {output_prices,isOutOfRange} = validatePrices(prices);
        if(isOutOfRange)
        {
            console.log("price for index pair",from_symbol,"/",to_symbol," from below sources are out of range");
            output_prices.forEach(function (element) {
                console.log("provider:",element.provider,", price:",element.price);
            });
        }
        else{
            console.log("price for index pair",from_symbol,"/",to_symbol," from all sources are in range");
            output_prices.forEach(function (element) {
                console.log("provider:",element.provider,", price:",element.price);
            });
        }
        return {output_prices,isOutOfRange};
    }
    catch (err) {
        console.log(err.message);
    }
}

function fetchPriceFromResponses(responses){
    let prices = [];
    responses.map(result => {
        let provider = result.config.provider_name.toString()
        if (provider === constants.BITTRUE) {
            prices.push({ 'provider': provider, 'price': +result.data.price });
        }
        else if (result.config.provider_name.toString() === constants.KUCOIN) {
            prices.push({ 'provider': provider, 'price': +result.data.data.price });
        }
        else if (provider === constants.TL_CRYPTO_COMPARE) {
            prices.push({ 'provider': provider, 'price': +result.data[from_symbol][to_symbol] });
        }
        else if (provider === constants.TL_TRADER_MADE) {
            prices.push({ 'provider': provider, 'price': +result.data[from_symbol][to_symbol] });
        }
    })
    return prices;
}
//validates the prices from all sources
function validatePrices(prices) {
    prices.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    let outOfRangePrices = getOutOfRangeProviders(prices);

    if(outOfRangePrices){
        return {output_prices:outOfRangePrices,isOutOfRange:true};
    }
    else{
        return {output_prices:prices,isOutOfRange:false};
    }
}

//algorithm to identify if providers that has prices out of range by 5%
function getOutOfRangeProviders(prices) {
    var inRangeSet = new Set();
    var outOfRangeSet = new Set();
    var isOutOfRange = false;
    for (let i = 0; i < prices.length; i++) {
        if (prices[i].price <= 0){
            isOutOfRange = true;
            outOfRangeSet.add(prices[i]);
            continue;
        }
        for (let j = i+1; j < prices.length; j++) {
            let low = prices[i].price - ((prices[i].price * constants.TOLERANCE_PERCENTAGE) / 100);
            let high = prices[i].price + ((prices[i].price * constants.TOLERANCE_PERCENTAGE) / 100);
            if (prices[j].price >= low && prices[j].price <= high) {
                //console.log("IN RANGE \nlow:",low,"\nhigh",high,"\nprice[i]",prices[i].price,"\nprice[j]",prices[j].price);
                inRangeSet.add(prices[j]);
                inRangeSet.add(prices[i]);
                continue;
            }
            else {
                //console.log("OUT OF RANGE \nlow:",low,"\nhigh",high,"\nprice[i]",prices[i].price,"\nprice[j]",prices[j].price);
                outOfRangeSet.add(prices[i]);
                outOfRangeSet.add(prices[j]);
                isOutOfRange = true;
            }
        }
    }
    inRangeSet.forEach(function (inrangeElements) {
        outOfRangeSet.delete(inrangeElements);
    });
    if(isOutOfRange === false){
        return null; //none of the prices are out of range
    }
    else if(isOutOfRange === true && outOfRangeSet.size === 0)
    {
        return prices;//all the prices are out of range
    }
    return outOfRangeSet;
}

//module.exports.validatePriceFeedData(from_symbol,to_symbol,providers);