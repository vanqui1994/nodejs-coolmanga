var request = require('request');
const  xpath = require('xpath');
const dom = require('xmldom').DOMParser;


var options = {
    method: 'GET',
    url: 'http://www.nettruyen.com/truyen-tranh/nga-quy-vung-tokyo-phan-2/chap-155/361031'
};

request(options, function (error, response, body) {
    if (error){
        throw new Error(error);
    }
        
    var html = body;
    var doc = new dom({errorHandler: {warning: (msg) => {}}}).parseFromString(html);
    var nodes = xpath.select("//div[@class='container']/div[@class='row']/div[@id='ctl00_divCenter']/div[@class='reading']/div[@class='reading-detail box_doc']/div/img/@src", doc);
    var arrImg = [];
    nodes.forEach(function (element) {
        if (element.value) {
            arrImg.push(element.value);
        }
    });
    console.log(arrImg);
});
