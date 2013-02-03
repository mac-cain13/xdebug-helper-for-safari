var xdebug = (function() {
	var currentState = "noPage",
		exposed = {
			// Handle activation of a tab/window
			onTabSwitched : function(event) {
				updateState();
			},

			// Validate the state of the menu items
			onValidate : function(event) {
				if ("togglebutton" != event.target.identifier) {
					var checkMenuItem = ("noPage" == currentState) ? "disabled" : currentState;
					event.target.checkedState = (checkMenuItem == event.target.identifier) ? SafariExtensionMenuItem.CHECKED : SafariExtensionMenuItem.UNCHECKED;
					event.target.disabled = ("noPage" == currentState);
				}
			},

			// Handle commands such as menu clicks
			onCommand : function(event) {
				var isDispatched = dispatchMessageToActiveTabInActiveWindow("setState", { state: event.command, ideKey: safari.extension.settings.ideKey });
				if (!isDispatched) {
					alert("Failed to toggle to the requested state. Please refresh and try again.");
				}
			},

			// Handle incomming messages
			onMessage : function(event) {
				if ("getStateResponse" == event.name || "setStateResponse" == event.name) {
					currentState = event.message;
				}
			}
		};

	// Triggers an update of the currentState variable
	function updateState() {
		currentState = "noPage";
		dispatchMessageToActiveTabInActiveWindow("getState", { ideKey: safari.extension.settings.ideKey });
	}

	// Dispatch a message to the active tab if there is one
	function dispatchMessageToActiveTabInActiveWindow(command, message) {
		// Check if there is a page in the activeTab
		if (safari.application.activeBrowserWindow.activeTab.page) {
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(command, message);
			return true;
		} else {
			return false;
		}
	}

	return exposed;
})();

safari.application.addEventListener("activate", xdebug.onTabSwitched, true);
safari.application.addEventListener("navigate", xdebug.onTabSwitched, true);
safari.application.addEventListener("validate", xdebug.onValidate, true);
safari.application.addEventListener("command", xdebug.onCommand, true);
safari.application.addEventListener("message", xdebug.onMessage, false);
