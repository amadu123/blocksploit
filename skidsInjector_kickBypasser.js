// ==UserScript==
// @name         Blocksploit Loader and Kick Bypass
// @supportURL   https://www.paypal.com/paypalme/blockman02135
// @homepage     https://blocksploit.github.io/
// @iconURL      https://i.imgur.com/y4xvKAH.png
// @version      0.1
// @description  try to take over the world!
// @author       Blockman
// @require      https://rawgit.com/kawanet/msgpack-lite/master/dist/msgpack.min.js
// @match        *://venge.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

let downloadScript = function(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false /*async bool*/);
    xhr.send();
    if (xhr.status != 200) {
        alert('Error Downloading Blocksploit');
        return null;
    }
    return xhr.responseText;
}

let injectScript = function(doc, text) {
    if ( !doc ) { return; }
    let script;
    try {
        script = doc.createElement('script');
        script.appendChild(doc.createTextNode(text));
        (doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement).appendChild(script);
    } catch (ex) {
    }
    if ( script ) {
        if ( script.parentNode ) {
            script.parentNode.removeChild(script);
        }
        script.textContent = '';
    }
};

window.WebSocket = new Proxy(window.WebSocket, {
    construct: function(target, args) {
        const ws = new target(...args);

        const openHandler = (event) => {
            console.log('Open', event);
        };

        const messageHandler = (event) => {
            let typedArray = new Uint8Array(event.data);
            let [id, ...data] = window.msgpack.decode(typedArray);
        };

        const closeHandler = (event) => {
            console.log('Close', event);
            ws.removeEventListener('open', openHandler);
            ws.removeEventListener('message', messageHandler);
            ws.removeEventListener('close', closeHandler);
        };

        ws.addEventListener('open', openHandler);
        ws.addEventListener('message', messageHandler);
        ws.addEventListener('close', closeHandler);

        ws.send = new Proxy(ws.send, {
            apply(target, that, [data]) {
                let typedArray = new Uint8Array(data);
                let [id, ...msg] = window.msgpack.decode(typedArray);
                //console.log(id, ...msg)
                if (id !== "discard_object") return Reflect.apply(...arguments);
            }
        })

        return ws;
    }
});

let script = downloadScript("https://raw.githubusercontent.com/blocksploit/blocksploit/main/custominject.js");

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    injectScript(document, script);
});
