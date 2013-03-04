
// ------------------------------------------------------------------
// use helper functions to hook up the test object so "this"
// works in the explorer object
// ------------------------------------------------------------------

function test_startup() {
  test.startup();
}

function test_shutdown() {
  
  test.shutdown();
}


// ------------------------------------------------------------------
// attach to window events so test object can startup / shutdown
// ------------------------------------------------------------------

window.addEventListener("load", test_startup, false);
window.addEventListener("unload", test_shutdown, false);


// ------------------------------------------------------------------
// test object
// ------------------------------------------------------------------

var test = {
  initialized : false,
  
  _handleWindowClose : function(event) {
    // handler for clicking on the 'x' to close the window
    return this.shutdownQuery();
  },


  _initSidebar : function(sidebarID) {
    if (sidebarID) {
      var sidebar = document.getElementById(sidebarID);
      var sidebarDeck = document.getElementById("sidebar_deck");
      sidebarDeck.selectedPanel = sidebar;
      var sidebarTitle = document.getElementById("sidebar_title");
      sidebarTitle.value = sidebar.getAttribute("label");
    }
  },

  toggleSidebar : function(sidebarID, forceOpen) {
    var sidebarBox = document.getElementById("sidebar_box");
    var sidebarSplitter = document.getElementById("sidebar_split");
    if (forceOpen || sidebarBox.hidden) {
      sidebarBox.hidden = false;
      sidebarSplitter.hidden = false;

      this._initSidebar(sidebarID);      
    }
    else {
      sidebarBox.hidden = true;
      sidebarSplitter.hidden = true;
    }
  },
  
  butGoClick: function() {
    var url = document.getElementById("txtUrl").value;
	
    document.getElementById("browserMain").loadURI( url );
  },


  startup : function() {
    if (this.initialized)
      return;
    this.initialized = true;

    var self = this;

    window.addEventListener("close", function(event) { self._handleWindowClose(event); }, false);


    // initialize the sidebar
    document.getElementById("sidebar_close").addEventListener("command", function(event) { self.toggleSidebar(null, null); }, false);
    this._initSidebar("sidebar_page1");

	document.getElementById("butGo").addEventListener("click", function(event) { self.butGoClick(); }, false);

	////
    FileController.init(this);
    window.controllers.appendController(FileController);

    ToolsController.init(this);
    window.controllers.appendController(ToolsController);

    HelpController.init(this);
    window.controllers.appendController(HelpController);
  },

  shutdownQuery : function() {
    // do any shutdown checks
    // return false to stop the shutdown
    return true;
  },
    
  shutdown : function() {

  }
};
