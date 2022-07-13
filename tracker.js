const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

module.exports.getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    // 1. send connect request
    updSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect'){
            // 2. receive and parse connect response
            const connResp = parseConnResp(response);
            // 3. send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            updSend(socket, announceReq, url);
        }else if (respType(response) === 'announce'){

            // 4. parse announce response
            const announceResp = parseAnnounceResp(response)
            // 5. pass peers to callback
            callback(announceResp.peers);
        }
    });
};

function updSend(socket, message, rawUrl, callback=()=>{}){
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.lenght, url.port, url.host, callback)
}

function respType(resp){

}

function buildConnReq(){

}

function parseConnResp(resp){

}

function buildAnnounceReq(connId){

}

function parseAnnounceResp(resp){

}



