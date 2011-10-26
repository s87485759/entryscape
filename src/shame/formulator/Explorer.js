dojo.provide("shame.formulator.Explorer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.encoding.base64");
dojo.require("shame.formulator.FormletViewer");
dojo.require("shame.formulator.OntologyViewer");
dojo.require("shame.formulator.ExplorerClient");
dojo.require("shame.formulator.SelectionList");
dojo.require("dijit.Tooltip");

dojo.declare("shame.formulator.Explorer", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("shame.formulator", "ExplorerTemplate.html"),
  widgetsInTemplate: true,

  /* The Formulator Server with which this Explorer is associated should be running on
   * this.serverProtocol+"://"+this.serverHost+":"+this.serverPort
   */
  serverProtocol: "https",
  serverHost:"localhost",
  serverPort:8182,

  /* The ExplorerClient to use to contact the Formulator Server.
   */
  client:null,

  /* The shame.formulator.FormletViewer that will be used to display formlets.
   */
  formletViewer:null,

  /* The shame.formulator.OntologyViewer that will be used to display ontologies.
   */
  ontologyViewer:null,

	constructor: function(parameters, srcNodeRef) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
    this.loginUsernameInput.focus();
	},
	addFormlet: function() {
    this.mainView.selectChild(this.addFormletCP);
	},
	addOntology: function() {
    this.mainView.selectChild(this.addOntologyCP);
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.mainView.selectChild(this.loginCP);
    this.client = new shame.formulator.ExplorerClient({
      serverProtocol:this.serverProtocol,
      serverHost:this.serverHost,
      serverPort:this.serverPort
    });
    client = this.client;
    var exp = this;
    this.formletViewer = new shame.formulator.FormletViewer({
      client:client,
      onDeleteCallback:function(){
        exp.updateFormletSet();
      },
      onCopyCallback:function(){
        exp.updateFormletSet();
      }
    }, dojo.byId("formletViewerDiv"));
    this.ontologyViewer = new shame.formulator.OntologyViewer({
      client:client,
      onDeleteCallback:function(){
        exp.updateOntologySet();
      }
    },dojo.byId("ontologyViewerDiv"));
    this.updateFormletSet();
    this.updateOntologySet();
    this.updateUsername();
    /*
    dojo.connect(this.usernameButton,"onClick",function(){
      console.log("onClick");
      dijit.showTooltip("on the click",exp.usernameButton.domNode);
    });*/
	},

  /* Calls client.updateFormletSet and updates the on-screen formlet list upon successful updating
   */
  updateFormletSet:function(){
    var explorer = this;
    this.formletListError.innerHTML = "";
    this.client.updateResourceSet({
      resourcetype:"formlet",
      onSuccess:function(){
        explorer._updateFormletList();
      },
      onError:function(error){
        explorer.formletSelectionList.clear();
        explorer.formletListError.innerHTML="<font color='#FF0000'>Unable to fetch formlet list: "+error.status+".</font>\n"+error.responseText;
      }
    });
  },

  /* Calls client.updateOntologySet and updates the on-screen ontology list upon successful updating
   */
  updateOntologySet:function(){
    var explorer = this;
    this.ontologyListError.innerHTML = "";
    this.client.updateResourceSet({
      resourcetype:"ontology",
      onSuccess:function(){
        explorer._updateOntologyList();
      },
      onError:function(error){
        explorer.ontologySelectionList.clear();
        explorer.ontologyListError.innerHTML="<font color='#FF0000'>Unable to fetch ontology list: "+error.status+".</font>\n"+error.responseText;
      }
    });
  },
  
  /* Updates the onscreen representation of the current username associated with the ExplorerClient.
   */
  updateUsername:function(){
    if(this.client.username == null){
      this.usernameButton.setLabel("Currently active as &lt;anonymous&gt;");
    }else{
      /* avoid html injection, tags are actually acceptable in user names */
      this.usernameButton.setLabel("Currently active as <b>"+this.client.username.
                                   replace(/&/g,"&amp;").
                                   replace(/</g,"&lt;").
                                   replace(/>/g,"&gt;")+"</b>");
    }
  },

  /* Gives the user an opportunity to log in with new credentials.
   */
  displayLogin:function(){
    this.loginErrorDiv.innerHTML = "";
    this.mainView.selectChild(this.loginCP);
  },

  /* Updates ExplorerClient's credentials based on the values of the login form.
   */
  login:function(){
    if(this.loginUsernameInput.value != ""){
      var exp = this;
      this.client.isAuthentic({
        usr:this.loginUsernameInput.value,
        pass:this.loginPasswordInput.value,
        onSuccess:function(){
          exp.client.username = exp.loginUsernameInput.value;
          exp.client.password = exp.loginPasswordInput.value;
          exp.updateUsername();
          exp.loginErrorDiv.innerHTML = "";
        },
        onFailure:function(){
          exp.client.username = null;
          exp.client.password = null;
          exp.updateUsername();
          exp.loginErrorDiv.innerHTML = "<p><font color=\"red\">Failed to login.</font></p>";
        },
        onError:function(err){
          exp.client.username = null;
          exp.client.password = null;
          exp.updateUsername();
          exp.loginErrorDiv.innerHTML = "<p>"+err.responseText+"</p>";
        }
      });
    }else{
      this.client.username = null;
      this.client.password = null;
      this.updateUsername();
      this.loginErrorDiv.innerHTML = "";
    }
  },

  /* Clears the login form and sets credentials to anonymous user.
   */
  loginAnonymous:function(){
    this.client.username = null;
    this.client.password = null;
    this.loginUsernameInput.setValue("");
    this.loginPasswordInput.setValue("");
    this.updateUsername();
    this.loginErrorDiv.innerHTML = "";
  },

  /* Attempts to update the FormletViewer's currently selected formlet to the one by name name.
   * Makes sure that the FormletViewer is displayed in mainView.
   */
  selectFormlet:function(name){
    this.mainView.selectChild(this.formletViewerCP);
    this.formletViewer.displayFormlet(name);
  },

  /* Attempts to update the OntologyViewer's currently selected ontology to the one by name name.
   * Makes sure that the OntologyViewer is displayed in mainView.
   */
  selectOntology:function(name){
    this.mainView.selectChild(this.ontologyViewerCP);
    this.ontologyViewer.displayOntology(name);
  },

  /* Prevent normal form submitting and attempts to create a new formlet with the name indicated in
   * this.newFormletNameInput via this.client.newFormlet.
   */
  _newFormletFormSubmit:function(evt){
    evt.preventDefault();
    this.newFormletNameInput.validate();
    this.newFormletErrorSpace.innerHTML = "";
    if(this.newFormletNameInput.isValid()){
      var explorer = this;
      this.client.newFormlet(this.newFormletNameInput.getValue(),{
        onSuccess:function(){
          explorer._updateFormletList();
        },
        onError:function(err){
        explorer.newFormletErrorSpace.innerHTML = err.responseText;
      }});
    }
  },

  /* Prevent normal form submitting and attempts to create a new ontology with the name indicated in
   * this.newOntologyNameInput via this.client.newOntology.
   */
  _newOntologyFormSubmit:function(evt){
    evt.preventDefault();
    this.newOntologyNameInput.validate();
    this.newOntologyErrorSpace.innerHTML = "";
    if(this.newOntologyNameInput.isValid()){
      var explorer = this;
      this.client.newOntology(this.newOntologyNameInput.getValue(),{
        onSuccess:function(){
          explorer._updateOntologyList();
        },
        onError:function(err){
        explorer.newOntologyErrorSpace.innerHTML = err.responseText;
      }});
    }
  },

  /* Updates this.formletSelectionList from this.client.allFormlets.
   * Does not cause client/server communication.
   */
  _updateFormletList:function(){
    this.formletList.style.opacity=0;
    this.formletSelectionList.clear();
    explorer = this;
    client = this.client;
    for(var i = 0; i < client.allFormlets.length; i++){
      this.formletSelectionList.addItem(
        {label:client.allFormlets[i].name,
         onSelect:function(){
           explorer.selectFormlet(this.label);
         },
         onReselect:function(){
           explorer.selectFormlet(this.label);
         }
        });
    }
    dojo.fadeIn({node:this.formletList}).play();
  },

  /* Updates this.ontologySelectionList from this.client.allOntologies.
   * Does not cause client/server communication.
   */
  _updateOntologyList:function(){
    this.ontologyList.style.opacity=0;
    this.ontologySelectionList.clear();
    explorer = this;
    client = this.client;
    for(var i = 0; i < client.allOntologies.length; i++){
      this.ontologySelectionList.addItem(
        {label:client.allOntologies[i].name,
         onSelect:function(){
           explorer.selectOntology(this.label);
         },
         onReselect:function(){
           explorer.selectOntology(this.label);
         }
        });
    }
    dojo.fadeIn({node:this.ontologyList}).play();
  }
});