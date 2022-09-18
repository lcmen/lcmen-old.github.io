---
layout: default
title: CORS, CSRF and WebSockets
date: 2022-09-18
parent: Web
---

# CORS, CSRF and WebSockets

By default [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy){:target="_blank"}, prevents JavaScript (in the browser) from reading responses to cross-origin Ajax requests unless `Access-Control-Allow-Origin` header is specified in the response.

Non-simple requests need to sends a preflight request first (using OPTIONS method) to access control headers such as:

* Access-Control-Allow-Origin
* Access-Control-Allow-Methods
* Access-Control-Allow-Headers

to determine if the actual cross-site request is allowed to be performed.

Despite all these checks, access control policy does not prevent from Cross-Site Protection Forgery (CSRF), because same-oriign policy (SOP) is concerned with JavaScript reading the server's response from a clients request. CSRF attacks don't care about the response, they care about a side-effect (state change produced by the request), such as adding an administrative user or executing arbitrary code on the server.

Websockets are not constrained by the SOP - if handshake responses with 101 status (upgrade), then access control is not checked, and script on a malicious page can upgrade to websocket connection.
