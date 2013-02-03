var xdebug = (function() {
	var exposed = {
			// Handle incomming messages
			onMessage : function(event) {
				if (event.name == "getState") {
					safari.self.tab.dispatchMessage("getStateResponse", getState());
				} else {
					alert(event.name + ": " + event.message);
				}
			}
		};

	function getState() {
		return "debugging";
	}

	return exposed;
})();

// Only install even listeners in the main page
if (window.top === window) {
	safari.self.addEventListener("message", xdebug.onMessage, false);
}
