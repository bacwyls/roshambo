(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
$(document).ready ( function(){

var urbithttp = require("@urbit/http-api");
// var urbitob = require("urbit-ob");

var urb = new urbithttp.Urbit('', '', 'roshambo');
urb.ship = window.ship;
urb.verbose = true;

urb.subscribe({
    app: "roshambo",
    path: "/game-updates",
    event: updateGameState,
    err: console.log,
    quit: console.log,
  });


// SSE handler
// %roshambo sends game state upon:
//   establishing a game
//   and getting game results
// updates DOM accordingly
var global_timer;
var global_shoot_time;
function updateGameState(newGameState) {
  var shoot_time = newGameState['poise']['shoot-time'];
  var latency = newGameState['poise']['latency'];
  var current_time = new Date().getTime();
  global_shoot_time = shoot_time;

  clearInterval(global_timer);
  if((current_time >= shoot_time) && (current_time < shoot_time+latency)) {
    // results are in
    var shoot_opponent = newGameState['shoot-opponent']['shot'];
    var shoot_self = newGameState['shoot-self']['shot'];
    var game_result = computeGameResult(shoot_self, shoot_opponent);
    setGameStatus(game_result);

    shoot_opponent = charToShoot(shoot_opponent);
    shoot_self = charToShoot(shoot_self);
    setYouPlay(shoot_self);
    setThemPlay(shoot_opponent);
  }
  else if(current_time < shoot_time) {
    // game is established
    global_timer = setInterval(setTimer, 100);
    setGameStatus(1);
  }
}


/*
 * click events
 */

// exit game
function exit() {
  clearInterval(global_timer);
  setYouPlay("~");
  setThemPlay("~");
  setGameStatus(0);
  setUIState(0);
}
button = document.getElementById('leave-button'); 
button.addEventListener('click', exit);

// start game
var global_opponent;
function play() {
  var them = document.getElementById('opponent');
  /*
  if(!urbitob.isValidPatp(them.value)){
    return;
  }
  */
  global_opponent = them.value;

  urb.poke({ app:'roshambo', mark:'roshambo-ui-poise',
             json: global_opponent });

  setYouPlay("~");
  setThemPlay("?");
  setOpponentPatp(global_opponent);
  setGameStatus(0);
  setUIState(1);
}
button = document.getElementById('start-button'); 
button.addEventListener('click', play);

// set shoot and poise
function shoot() {
  var choices = document.getElementsByName('rshb');

  var chosen = false;
  var choice;
  for(i=0; i < choices.length; i++) {
    if(choices[i].checked) {
      chosen = true;
      choices[i].checked = false;
      choice = choices[i].value;
    }
  }

  if(!chosen) return;

  setYouPlay(choice);
  setThemPlay("?");

  // %poise if not already set
  var current_time = new Date().getTime();
  if( global_game_status != 1 ||
      current_time > global_shoot_time ) {
    urb.poke({ app:'roshambo',
               mark:'roshambo-ui-poise',
               json: global_opponent });
    setGameStatus(0);
  }

  urb.poke({ app:'roshambo',
             mark:'roshambo-ui-shoot',
             json: choice[0] });

}
button = document.getElementById('shoot-button'); 
button.addEventListener('click', shoot);


/*
 * helpers for manipulating DOM
 */

var global_ui_state;
function setUIState(ui_state) {
  global_ui_state = ui_state;
  var nogame = document.getElementById('no-game');
  var playgame = document.getElementById('game');
  if(ui_state == 0) {
    playgame.style.display = 'none';
    nogame.style.removeProperty('display');
  }
  else if(ui_state == 1) {
    nogame.style.display = 'none';
    playgame.style.removeProperty('display');
  }
}

var global_game_status;
function setGameStatus(game_status) {
  var statusblock = document.getElementById('status-block');
  var statusmsg   = document.getElementById('status-msg'); 
  global_game_status = game_status;

  switch(game_status) {
  case 0:
    // default
    statusblock.style.removeProperty('background-color');
    statusblock.style.color = "black";
    statusmsg.textContent = "...";
    break;
  case 1:
    // confirmed time
    statusblock.style.backgroundColor = "yellow";
    statusblock.style.color = "black";
    statusmsg.textContent = "game in progress."
    break;
  case 2:
    // you win
    statusblock.style.backgroundColor = "green";
    statusblock.style.color = "white";
    statusmsg.textContent = "you win!";
    break;
  case 3:
    // you lose
    statusblock.style.backgroundColor = "red";
    statusblock.style.color = "white";
    statusmsg.textContent = "you lose :-(";
    break;
  case 4:
    // tie
    statusblock.style.backgroundColor = "gray";
    statusblock.style.color = "white";
    statusmsg.textContent = "you tied :/";
    break;
  }
}

// accepts two strings r, p, or s
// returns a game_status int for setGameStatus
// 2 : win
// 3 : lose
// 4 : tie
function computeGameResult(shoot_self, shoot_opponent) {
  if(shoot_self == shoot_opponent) {
    return 4;
  }
  if( ((shoot_self == "r") && (shoot_opponent == "s")) ||
      ((shoot_self == "s") && (shoot_opponent == "p")) ||
      ((shoot_self == "p") && (shoot_opponent == "r")) ){
    return 2;
  }
  return 3;
}

// countdown timer during game
function setTimer() {
  var statusmsg = document.getElementById('status-msg'); 
  var current_time = new Date().getTime();
  var diff = global_shoot_time - current_time;
  statusmsg.textContent = Math.ceil(diff/1000) + " seconds.";
  if(diff<200){
    statusmsg.textContent = "time up."; 
    clearInterval(global_timer);
  }
}

function charToShoot(c) {
  if(c == "r"){
    return "rock";
    }
  else if(c == "p"){
    return "paper";
    }
  else if(c == "s"){
    return "scissors";
    }
  else return null;
}

function setOpponentPatp(patp) {
  document.getElementById('opponent-patp').textContent = patp;
}

function setYouPlay(play) {
  document.getElementById('you-play').textContent = play;
}

function setThemPlay(play) {
  document.getElementById('them-play').textContent = play;
}
});


},{"@urbit/http-api":2}],2:[function(require,module,exports){
(function (process){(function (){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ResumableError extends Error {
}
class FatalError extends Error {
}

var lib = {};

Object.defineProperty(lib, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global window self */

var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/* eslint-disable no-restricted-globals */
var isWebWorker = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';
/* eslint-enable no-restricted-globals */

var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
/* eslint-disable no-undef */
var isJsDom = function isJsDom() {
  return typeof window !== 'undefined' && window.name === 'nodejs' || navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom');
};

var isBrowser_1 = lib.isBrowser = isBrowser;
lib.isWebWorker = isWebWorker;
lib.isNode = isNode;
lib.isJsDom = isJsDom;

async function getBytes(stream, onChunk) {
    const reader = stream.getReader();
    let result;
    while (!(result = await reader.read()).done) {
        onChunk(result.value);
    }
}
function getLines(onLine) {
    let buffer;
    let position;
    let fieldLength;
    let discardTrailingNewline = false;
    return function onChunk(arr) {
        if (buffer === undefined) {
            buffer = arr;
            position = 0;
            fieldLength = -1;
        }
        else {
            buffer = concat(buffer, arr);
        }
        const bufLength = buffer.length;
        let lineStart = 0;
        while (position < bufLength) {
            if (discardTrailingNewline) {
                if (buffer[position] === 10) {
                    lineStart = ++position;
                }
                discardTrailingNewline = false;
            }
            let lineEnd = -1;
            for (; position < bufLength && lineEnd === -1; ++position) {
                switch (buffer[position]) {
                    case 58:
                        if (fieldLength === -1) {
                            fieldLength = position - lineStart;
                        }
                        break;
                    case 13:
                        discardTrailingNewline = true;
                    case 10:
                        lineEnd = position;
                        break;
                }
            }
            if (lineEnd === -1) {
                break;
            }
            onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
            lineStart = position;
            fieldLength = -1;
        }
        if (lineStart === bufLength) {
            buffer = undefined;
        }
        else if (lineStart !== 0) {
            buffer = buffer.subarray(lineStart);
            position -= lineStart;
        }
    };
}
function getMessages(onId, onRetry, onMessage) {
    let message = newMessage();
    const decoder = new TextDecoder();
    return function onLine(line, fieldLength) {
        if (line.length === 0) {
            onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
            message = newMessage();
        }
        else if (fieldLength > 0) {
            const field = decoder.decode(line.subarray(0, fieldLength));
            const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
            const value = decoder.decode(line.subarray(valueOffset));
            switch (field) {
                case 'data':
                    message.data = message.data
                        ? message.data + '\n' + value
                        : value;
                    break;
                case 'event':
                    message.event = value;
                    break;
                case 'id':
                    onId(message.id = value);
                    break;
                case 'retry':
                    const retry = parseInt(value, 10);
                    if (!isNaN(retry)) {
                        onRetry(message.retry = retry);
                    }
                    break;
            }
        }
    };
}
function concat(a, b) {
    const res = new Uint8Array(a.length + b.length);
    res.set(a);
    res.set(b, a.length);
    return res;
}
function newMessage() {
    return {
        data: '',
        event: '',
        id: '',
        retry: undefined,
    };
}

var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const EventStreamContentType = 'text/event-stream';
const DefaultRetryInterval = 1000;
const LastEventId = 'last-event-id';
function fetchEventSource(input, _a) {
    var { signal: inputSignal, headers: inputHeaders, onopen: inputOnOpen, onmessage, onclose, onerror, openWhenHidden, fetch: inputFetch } = _a, rest = __rest(_a, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
    return new Promise((resolve, reject) => {
        const headers = Object.assign({}, inputHeaders);
        if (!headers.accept) {
            headers.accept = EventStreamContentType;
        }
        let curRequestController;
        function onVisibilityChange() {
            curRequestController.abort();
            if (!document.hidden) {
                create();
            }
        }
        if (!openWhenHidden) {
            document.addEventListener('visibilitychange', onVisibilityChange);
        }
        let retryInterval = DefaultRetryInterval;
        let retryTimer = 0;
        function dispose() {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.clearTimeout(retryTimer);
            curRequestController.abort();
        }
        inputSignal === null || inputSignal === void 0 ? void 0 : inputSignal.addEventListener('abort', () => {
            dispose();
            resolve();
        });
        const fetch = inputFetch !== null && inputFetch !== void 0 ? inputFetch : window.fetch;
        const onopen = inputOnOpen !== null && inputOnOpen !== void 0 ? inputOnOpen : defaultOnOpen;
        async function create() {
            var _a;
            curRequestController = new AbortController();
            try {
                const response = await fetch(input, Object.assign(Object.assign({}, rest), { headers, signal: curRequestController.signal }));
                await onopen(response);
                await getBytes(response.body, getLines(getMessages(id => {
                    if (id) {
                        headers[LastEventId] = id;
                    }
                    else {
                        delete headers[LastEventId];
                    }
                }, retry => {
                    retryInterval = retry;
                }, onmessage)));
                onclose === null || onclose === void 0 ? void 0 : onclose();
                dispose();
                resolve();
            }
            catch (err) {
                if (!curRequestController.signal.aborted) {
                    try {
                        const interval = (_a = onerror === null || onerror === void 0 ? void 0 : onerror(err)) !== null && _a !== void 0 ? _a : retryInterval;
                        window.clearTimeout(retryTimer);
                        retryTimer = window.setTimeout(create, interval);
                    }
                    catch (innerErr) {
                        dispose();
                        reject(innerErr);
                    }
                }
            }
        }
        create();
    });
}
function defaultOnOpen(response) {
    const contentType = response.headers.get('content-type');
    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith(EventStreamContentType))) {
        throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
    }
}

/**
 * Returns a hex string of given length.
 *
 * Poached from StackOverflow.
 *
 * @param len Length of hex string to return.
 */
function hexString(len) {
    const maxlen = 8;
    const min = Math.pow(16, Math.min(len, maxlen) - 1);
    const max = Math.pow(16, Math.min(len, maxlen)) - 1;
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    let r = n.toString(16);
    while (r.length < len) {
        r = r + hexString(len - maxlen);
    }
    return r;
}

/**
 * A class for interacting with an urbit ship, given its URL and code
 */
class Urbit {
    /**
     * Constructs a new Urbit connection.
     *
     * @param url  The URL (with protocol and port) of the ship to be accessed. If
     * the airlock is running in a webpage served by the ship, this should just
     * be the empty string.
     * @param code The access code for the ship at that address
     */
    constructor(url, code, desk) {
        this.url = url;
        this.code = code;
        this.desk = desk;
        /**
         * UID will be used for the channel: The current unix time plus a random hex string
         */
        this.uid = `${Math.floor(Date.now() / 1000)}-${hexString(6)}`;
        /**
         * Last Event ID is an auto-updated index of which events have been sent over this channel
         */
        this.lastEventId = 0;
        this.lastAcknowledgedEventId = 0;
        /**
         * SSE Client is null for now; we don't want to start polling until it the channel exists
         */
        this.sseClientInitialized = false;
        /**
         * A registry of requestId to successFunc/failureFunc
         *
         * These functions are registered during a +poke and are executed
         * in the onServerEvent()/onServerError() callbacks. Only one of
         * the functions will be called, and the outstanding poke will be
         * removed after calling the success or failure function.
         */
        this.outstandingPokes = new Map();
        /**
         * A registry of requestId to subscription functions.
         *
         * These functions are registered during a +subscribe and are
         * executed in the onServerEvent()/onServerError() callbacks. The
         * event function will be called whenever a new piece of data on this
         * subscription is available, which may be 0, 1, or many times. The
         * disconnect function may be called exactly once.
         */
        this.outstandingSubscriptions = new Map();
        /**
         * Our abort controller, used to close the connection
         */
        this.abort = new AbortController();
        /**
         * number of consecutive errors in connecting to the eventsource
         */
        this.errorCount = 0;
        this.onError = null;
        this.onRetry = null;
        this.onOpen = null;
        if (isBrowser_1) {
            window.addEventListener('beforeunload', this.delete);
        }
        return this;
    }
    /** This is basic interpolation to get the channel URL of an instantiated Urbit connection. */
    get channelUrl() {
        return `${this.url}/~/channel/${this.uid}`;
    }
    get fetchOptions() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (!isBrowser_1) {
            headers.Cookie = this.cookie;
        }
        return {
            credentials: 'include',
            accept: '*',
            headers,
            signal: this.abort.signal,
        };
    }
    /**
     * All-in-one hook-me-up.
     *
     * Given a ship, url, and code, this returns an airlock connection
     * that is ready to go. It `|hi`s itself to create the channel,
     * then opens the channel via EventSource.
     *
     */
    static async authenticate({ ship, url, code, verbose = false, }) {
        const airlock = new Urbit(`http://${url}`, code);
        airlock.verbose = verbose;
        airlock.ship = ship;
        await airlock.connect();
        await airlock.poke({
            app: 'hood',
            mark: 'helm-hi',
            json: 'opening airlock',
        });
        await airlock.eventSource();
        return airlock;
    }
    /**
     * Connects to the Urbit ship. Nothing can be done until this is called.
     * That's why we roll it into this.authenticate
     */
    async connect() {
        if (this.verbose) {
            console.log(`password=${this.code} `, isBrowser_1
                ? 'Connecting in browser context at ' + `${this.url}/~/login`
                : 'Connecting from node context');
        }
        return fetch(`${this.url}/~/login`, {
            method: 'post',
            body: `password=${this.code}`,
            credentials: 'include',
        }).then((response) => {
            if (this.verbose) {
                console.log('Received authentication response', response);
            }
            const cookie = response.headers.get('set-cookie');
            if (!this.ship) {
                this.ship = new RegExp(/urbauth-~([\w-]+)/).exec(cookie)[1];
            }
            if (!isBrowser_1) {
                this.cookie = cookie;
            }
        });
    }
    /**
     * Initializes the SSE pipe for the appropriate channel.
     */
    async eventSource() {
        if (this.sseClientInitialized) {
            return Promise.resolve();
        }
        if (this.lastEventId === 0) {
            // Can't receive events until the channel is open,
            // so poke and open then
            await this.poke({
                app: 'hood',
                mark: 'helm-hi',
                json: 'Opening API channel',
            });
            return;
        }
        this.sseClientInitialized = true;
        return new Promise((resolve, reject) => {
            fetchEventSource(this.channelUrl, {
                ...this.fetchOptions,
                openWhenHidden: true,
                onopen: async (response) => {
                    if (this.verbose) {
                        console.log('Opened eventsource', response);
                    }
                    if (response.ok) {
                        this.errorCount = 0;
                        this.onOpen && this.onOpen();
                        resolve();
                        return; // everything's good
                    }
                    else {
                        const err = new Error('failed to open eventsource');
                        reject(err);
                    }
                },
                onmessage: (event) => {
                    if (this.verbose) {
                        console.log('Received SSE: ', event);
                    }
                    if (!event.id)
                        return;
                    this.lastEventId = parseInt(event.id, 10);
                    if (this.lastEventId - this.lastAcknowledgedEventId > 20) {
                        this.ack(this.lastEventId);
                    }
                    if (event.data && JSON.parse(event.data)) {
                        const data = JSON.parse(event.data);
                        if (data.response === 'poke' &&
                            this.outstandingPokes.has(data.id)) {
                            const funcs = this.outstandingPokes.get(data.id);
                            if (data.hasOwnProperty('ok')) {
                                funcs.onSuccess();
                            }
                            else if (data.hasOwnProperty('err')) {
                                console.error(data.err);
                                funcs.onError(data.err);
                            }
                            else {
                                console.error('Invalid poke response', data);
                            }
                            this.outstandingPokes.delete(data.id);
                        }
                        else if (data.response === 'subscribe' &&
                            this.outstandingSubscriptions.has(data.id)) {
                            const funcs = this.outstandingSubscriptions.get(data.id);
                            if (data.hasOwnProperty('err')) {
                                console.error(data.err);
                                funcs.err(data.err, data.id);
                                this.outstandingSubscriptions.delete(data.id);
                            }
                        }
                        else if (data.response === 'diff' &&
                            this.outstandingSubscriptions.has(data.id)) {
                            const funcs = this.outstandingSubscriptions.get(data.id);
                            try {
                                funcs.event(data.json);
                            }
                            catch (e) {
                                console.error('Failed to call subscription event callback', e);
                            }
                        }
                        else if (data.response === 'quit' &&
                            this.outstandingSubscriptions.has(data.id)) {
                            const funcs = this.outstandingSubscriptions.get(data.id);
                            funcs.quit(data);
                            this.outstandingSubscriptions.delete(data.id);
                        }
                        else {
                            console.log([...this.outstandingSubscriptions.keys()]);
                            console.log('Unrecognized response', data);
                        }
                    }
                },
                onerror: (error) => {
                    console.warn(error);
                    if (this.errorCount++ < 4) {
                        this.onRetry && this.onRetry();
                        return Math.pow(2, this.errorCount - 1) * 750;
                    }
                    this.onError && this.onError(error);
                    throw error;
                },
                onclose: () => {
                    console.log('e');
                    throw new Error('Ship unexpectedly closed the connection');
                },
            });
        });
    }
    /**
     * Reset airlock, abandoning current subscriptions and wiping state
     *
     */
    reset() {
        this.delete();
        this.abort.abort();
        this.abort = new AbortController();
        this.uid = `${Math.floor(Date.now() / 1000)}-${hexString(6)}`;
        this.lastEventId = 0;
        this.lastAcknowledgedEventId = 0;
        this.outstandingSubscriptions = new Map();
        this.outstandingPokes = new Map();
        this.sseClientInitialized = false;
    }
    /**
     * Autoincrements the next event ID for the appropriate channel.
     */
    getEventId() {
        this.lastEventId = Number(this.lastEventId) + 1;
        return this.lastEventId;
    }
    /**
     * Acknowledges an event.
     *
     * @param eventId The event to acknowledge.
     */
    async ack(eventId) {
        this.lastAcknowledgedEventId = eventId;
        const message = {
            action: 'ack',
            'event-id': eventId,
        };
        await this.sendJSONtoChannel(message);
        return eventId;
    }
    async sendJSONtoChannel(...json) {
        const response = await fetch(this.channelUrl, {
            ...this.fetchOptions,
            method: 'PUT',
            body: JSON.stringify(json),
        });
        if (!response.ok) {
            throw new Error('Failed to PUT channel');
        }
        if (!this.sseClientInitialized) {
            await this.eventSource();
        }
    }
    /**
     * Creates a subscription, waits for a fact and then unsubscribes
     *
     * @param app Name of gall agent to subscribe to
     * @param path Path to subscribe to
     * @param timeout Optional timeout before ending subscription
     *
     * @returns The first fact on the subcription
     */
    async subscribeOnce(app, path, timeout) {
        return new Promise(async (resolve, reject) => {
            let done = false;
            let id = null;
            const quit = () => {
                if (!done) {
                    reject('quit');
                }
            };
            const event = (e) => {
                if (!done) {
                    resolve(e);
                    this.unsubscribe(id);
                }
            };
            const request = { app, path, event, err: reject, quit };
            id = await this.subscribe(request);
            if (timeout) {
                setTimeout(() => {
                    if (!done) {
                        done = true;
                        reject('timeout');
                        this.unsubscribe(id);
                    }
                }, timeout);
            }
        });
    }
    /**
     * Pokes a ship with data.
     *
     * @param app The app to poke
     * @param mark The mark of the data being sent
     * @param json The data to send
     */
    async poke(params) {
        const { app, mark, json, ship, onSuccess, onError } = {
            onSuccess: () => { },
            onError: () => { },
            ship: this.ship,
            ...params,
        };
        const message = {
            id: this.getEventId(),
            action: 'poke',
            ship,
            app,
            mark,
            json,
        };
        const [send, result] = await Promise.all([
            this.sendJSONtoChannel(message),
            new Promise((resolve, reject) => {
                this.outstandingPokes.set(message.id, {
                    onSuccess: () => {
                        onSuccess();
                        resolve(message.id);
                    },
                    onError: (event) => {
                        onError(event);
                        reject(event.err);
                    },
                });
            }),
        ]);
        return result;
    }
    /**
     * Subscribes to a path on an app on a ship.
     *
     *
     * @param app The app to subsribe to
     * @param path The path to which to subscribe
     * @param handlers Handlers to deal with various events of the subscription
     */
    async subscribe(params) {
        const { app, path, ship, err, event, quit } = {
            err: () => { },
            event: () => { },
            quit: () => { },
            ship: this.ship,
            ...params,
        };
        const message = {
            id: this.getEventId(),
            action: 'subscribe',
            ship,
            app,
            path,
        };
        this.outstandingSubscriptions.set(message.id, {
            app,
            path,
            err,
            event,
            quit,
        });
        await this.sendJSONtoChannel(message);
        return message.id;
    }
    /**
     * Unsubscribes to a given subscription.
     *
     * @param subscription
     */
    async unsubscribe(subscription) {
        return this.sendJSONtoChannel({
            id: this.getEventId(),
            action: 'unsubscribe',
            subscription,
        }).then(() => {
            this.outstandingSubscriptions.delete(subscription);
        });
    }
    /**
     * Deletes the connection to a channel.
     */
    delete() {
        if (isBrowser_1) {
            navigator.sendBeacon(this.channelUrl, JSON.stringify([
                {
                    action: 'delete',
                },
            ]));
        }
    }
    /**
     * Scry into an gall agent at a path
     *
     * @typeParam T - Type of the scry result
     *
     * @remarks
     *
     * Equivalent to
     * ```hoon
     * .^(T %gx /(scot %p our)/[app]/(scot %da now)/[path]/json)
     * ```
     * The returned cage must have a conversion to JSON for the scry to succeed
     *
     * @param params The scry request
     * @returns The scry result
     */
    async scry(params) {
        const { app, path } = params;
        const response = await fetch(`${this.url}/~/scry/${app}${path}.json`, this.fetchOptions);
        return await response.json();
    }
    /**
     * Run a thread
     *
     *
     * @param inputMark   The mark of the data being sent
     * @param outputMark  The mark of the data being returned
     * @param threadName  The thread to run
     * @param body        The data to send to the thread
     * @returns  The return value of the thread
     */
    async thread(params) {
        const { inputMark, outputMark, threadName, body, desk = this.desk, } = params;
        if (!desk) {
            throw new Error('Must supply desk to run thread from');
        }
        const res = await fetch(`${this.url}/spider/${desk}/${inputMark}/${threadName}/${outputMark}.json`, {
            ...this.fetchOptions,
            method: 'POST',
            body: JSON.stringify(body),
        });
        return res.json();
    }
    /**
     * Utility function to connect to a ship that has its *.arvo.network domain configured.
     *
     * @param name Name of the ship e.g. zod
     * @param code Code to log in
     */
    static async onArvoNetwork(ship, code) {
        const url = `https://${ship}.arvo.network`;
        return await Urbit.authenticate({ ship, url, code });
    }
}

exports.FatalError = FatalError;
exports.ResumableError = ResumableError;
exports.Urbit = Urbit;
exports["default"] = Urbit;


}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
