var xdebug = (function() {
	var exposed = {
			// Handle incomming messages
			onMessage : function(event) {
				if ("getState" == event.name) {
					safari.self.tab.dispatchMessage("getStateResponse", getState(event.message.ideKey));
				} else if ("setState" == event.name) {
					safari.self.tab.dispatchMessage("setStateResponse", setState(event.message.ideKey, event.message.state));
				} else {
					console.log("[Xdebug helper] Injected script received unknown message: " + event.name);
				}
			}
		};

	// Get the current Xdebug state
	function getState(ideKey) {
		var state = "disabled";

		if (getCookie("XDEBUG_SESSION") == ideKey) {
			state = "debugging";
		} else if (getCookie("XDEBUG_PROFILE") == ideKey) {
			state = "profiling";
		} else if (getCookie("XDEBUG_TRACE") == ideKey) {
			state = "tracing";
		}

		return state;
	}

	// Set Xdebug to the requested state
	function setState(ideKey, newState) {
		if (newState == "debug") {
			// Set debugging on
			setCookie("XDEBUG_SESSION", ideKey, 24);
			deleteCookie("XDEBUG_PROFILE");
			deleteCookie("XDEBUG_TRACE");
		} else if (newState == "profile") {
			// Set profiling on
			deleteCookie("XDEBUG_SESSION");
			setCookie("XDEBUG_PROFILE", ideKey, 24);
			deleteCookie("XDEBUG_TRACE");
		} else if (newState == "trace") {
			// Set tracing on
			deleteCookie("XDEBUG_SESSION");
			deleteCookie("XDEBUG_PROFILE");
			setCookie("XDEBUG_TRACE", ideKey, 24);
		} else {
			// Disable all Xdebug functions
			deleteCookie("XDEBUG_SESSION");
			deleteCookie("XDEBUG_PROFILE");
			deleteCookie("XDEBUG_TRACE");
		}

		return getState(ideKey);
	}

	// Set a cookie
	function setCookie(name, value, hours) {
		var exp = new Date();
		exp.setTime(exp.getTime() + (hours * 60 * 60 * 1000));
		document.cookie = name + "=" + value + "; expires=" + exp.toGMTString() + "; path=/";
	}

	// Get the cookie contents
	function getCookie(name) {
		// Search for the start of the goven cookie
		var prefix = name + "=",
			cookieStartIndex = document.cookie.indexOf(prefix),
			cookieEndIndex;

		// If the cookie is not found return null
		if (cookieStartIndex == -1) {
			return null;
		}

		// Look for the end of the cookie
		cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
		if (cookieEndIndex == -1) {
			cookieEndIndex = document.cookie.length;
		}

		// Extract the cookie content
		return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	}

	// Remove a cookie
	function deleteCookie(name) {
		setCookie(name, null, -60);
	}

	return exposed;
})();

// Only install event listeners in the main page, not in frames etc
if (window.top === window) {
	safari.self.addEventListener("message", xdebug.onMessage, false);
}
