const source = require('./constants');

module.exports.buildFeedSourceConfig = function(from_symbol, to_symbol, providers) {
    var feed_source_config = [];
    providers.forEach(function (element) {
        if (element.provider === source.BITTRUE) {
            feed_source_config.push(
                { provider_name: element.provider, 
                  url: getBittrueUrl(from_symbol, to_symbol),
                  method: 'GET',
                  data: {},
                  headers: { "api-key": element.apikey },
                 });
        }
        else if(element.provider === source.KUCOIN){
            feed_source_config.push(
                { provider_name: element.provider, 
                  url: getKuCoinUrl(from_symbol, to_symbol),
                  method: 'GET',
                  data: {},
                  headers: { "api-key": element.apikey},
                 });
        }
        else if(element.provider === source.TL_CRYPTO_COMPARE){
            feed_source_config.push(
                { provider_name: element.provider, 
                  url: getTeejlabCryptoCompareUrl(),
                  method: 'POST',
                  data: { "fsyms": from_symbol, "tsyms": to_symbol },
                  headers: { "api-key": element.apikey },
                 });
        }
        else if(element.provider === source.TL_TRADER_MADE){
            feed_source_config.push(
                { provider_name: element.provider, 
                  url: getTeejlabTraderMadeUrl(),
                  method: 'POST',
                  data: { "fsyms": from_symbol, "tsyms": to_symbol },
                  headers: { "api-key": element.apikey },
                 });
        }
    });
    return feed_source_config;
}


function getBittrueUrl(from_symbol, to_symbol) {
    var input = from_symbol.toString() + to_symbol.toString();
    const url = `https://openapi.bitrue.com/api/v1/ticker/price?symbol=${input}`;
    return url;
}

function getKuCoinUrl(from_symbol, to_symbol) {
    var input = from_symbol.toString() + "-" + to_symbol.toString();
    const url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${input}`
    return url;
}

function getTeejlabCryptoCompareUrl() {
    const url = `https://goplugin.apidiscovery.teejlab.com/edsn/api/gateway?endpoint_id=aHBrfib`
    return url;
}

function getTeejlabTraderMadeUrl(){
    const url = `https://goplugin.apidiscovery.teejlab.com/edsn/api/gateway?endpoint_id=aHHfTVb`
    return url;
}

