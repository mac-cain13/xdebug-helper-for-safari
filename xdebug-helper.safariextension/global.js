var xdebug = (function() {
	var currentState = "disabled",
		exposed = {
			// Handle activation of a tab/window
			onTabSwitched : function(event) {
				updateState();
			},

			// Validate the state of the menu items
			onValidate : function(event) {
				if (event.target.identifier != "togglebutton") {
					event.target.checkedState = (event.target.identifier == currentState) ? SafariExtensionMenuItem.CHECKED : SafariExtensionMenuItem.UNCHECKED;
				}
			},

			// Handle commands such as menu clicks
			onCommand : function(event) {
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("setStatus", event.command);
			},

			// Handle incomming messages
			onMessage : function(event) {
				if (event.name == "getStateResponse") {
					currentState = event.message;
				}
			}
		};

	function updateState() {
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("getState", null);
	}

	return exposed;
})();

safari.application.addEventListener("activate", xdebug.onTabSwitched, true);
safari.application.addEventListener("navigate", xdebug.onTabSwitched, true);
safari.application.addEventListener("validate", xdebug.onValidate, true);
safari.application.addEventListener("command", xdebug.onCommand, true);
safari.application.addEventListener("message", xdebug.onMessage, false);
