dojo.provide("shame.formulator.FormletViewer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("shame.formulator.ACLBox");

dojo.declare("shame.formulator.FormletViewer", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("shame.formulator", "FormletViewerTemplate.html"),
  widgetsInTemplate: true,
  /* The ExplorerClient to use to handle formlets.
   */
  client:null,

  /* The name of the formlet currently displayed, or null if no formlet is displayed.
   */
  currentFormlet:null,

  /* This function() will be called when the current formlet is deleted via this viewer.
   */
  onDeleteCallback:null,

  /* The dijit.form.FilteringSelect that will be used to add ontologies to a formlet.
   */
  ontologySelecter:null,

  /* The dojo.data.FileItemWriteStore that will be used to store items for this.ontologySelecter.
   */
  ontologySelecterStore:null,

  /* parameters will be mixed into this object using dojo.mixin.
   */
	constructor: function(parameters, srcNodeRef) {
    dojo.mixin(this,parameters);
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
    this.aclBox.client = this.client;
    this.copyButton.setAttribute("disabled",true);
    this.deleteButton.setAttribute("disabled",true);
    this.saveButton.setAttribute("disabled",true);
    this.revertButton.setAttribute("disabled",true);
    this.ontologySelecterAddButton.setAttribute("disabled",true);
    this.ontologySelecterDeleteButton.setAttribute("disabled",true);
    this.ontologySelecterStore = new dojo.data.ItemFileWriteStore({data:{
      identifier:"name",
      label:"name",
      items:[]
    }});
    this.ontologySelecter = new dijit.form.FilteringSelect({store:this.ontologySelecterStore},this.ontologySelecterDiv);
	},
	copyFormlet: function() {
    this.mainView.selectChild(this.copyCP);
	},

  /* Deletes the formlet currently displayed by this viewer. Does nothing if no formlet is currently
   * displayed. Clears this viewer and calls this.onDeleteCallback on successful deletion.
   */
	deleteFormlet: function() {
    var viewer = this;
    if(this.currentFormlet == null){
      /* nothing to delete */
      return;
    }
    /* Make the viewer blink to increase the feel of client responsitivity */
    dojo.fadeOut({
      node:viewer.domNode,
      duration:100,
      onEnd:function(){
        dojo.fadeIn({
          node:viewer.domNode,
          duration:100
        }).play();
      }
    }).play();
    this.client.deleteResource({
      resourcetype:"formlet",
      resourcename:viewer.currentFormlet,
      onSuccess:function(){
        viewer.clear();
        if(viewer.onDeleteCallback != null){
          viewer.onDeleteCallback();
        }
      },
      onError:function(err){
        alert("Failed to delete.");
      }
    });
	},
	saveFormlet: function() {
    var viewer = this;
    this.client.saveResourceRepresentation({
      resourcetype:"formlet",
      resourcename:viewer.currentFormlet,
      onSuccess:function(){
        viewer.client.allFormlets[viewer.client.indexOfResource({
          resourcetype:"formlet",
          resourcename:viewer.currentFormlet
        })].locallyModified = false;
        viewer.saveButton.setAttribute("disabled",true);
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
	},
  revertFormlet:function(){
    var viewer = this;
    this.client.updateResourceRepresentation({
      resourcetype:"formlet",
      resourcename:viewer.currentFormlet,
      onSuccess:function(){
        viewer.client.allFormlets[viewer.client.indexOfResource({
          resourcetype:"formlet",
          resourcename:viewer.currentFormlet
        })].locallyModified = false;
        viewer.saveButton.setAttribute("disabled",true);
        viewer.displayFormlet(viewer.currentFormlet);
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },

  /* Loads the formlet by the name name from this.client.
   */
  displayFormlet: function(name){
    var viewer = this;
    this.mainBorderContainer.layout();
    this.client.getResourceRepresentation({
      resourcetype:"formlet",
      resourcename:name,
      onSuccess:function(sirff){
        viewer.clear();
        viewer.currentFormlet = name;
        viewer.nameHeader.innerHTML="Formlet: "+name;
        viewer.editorCP.setContent("<p>"+dojo.toJson(sirff)+"</p>");
        viewer.aclBox.load({
          resourcetype:"formlet",
          resourcename:name,
          onError:function(err){viewer._error(err.responseText);}
        });
        viewer.mainView.selectChild(viewer.editorCP);
        viewer.copyButton.setAttribute("disabled",false);
        viewer.deleteButton.setAttribute("disabled",false);
        viewer.revertButton.setAttribute("disabled",false);
        viewer.ontologySelecterAddButton.setAttribute("disabled",false);
        viewer.ontologySelecterDeleteButton.setAttribute("disabled",false);
        var locallyModified = viewer.client.allFormlets[
          viewer.client.indexOfResource({
            resourcetype:"formlet",
            resourcename:viewer.currentFormlet
          })].locallyModified;
        viewer.saveButton.setAttribute("disabled",
                                       !(locallyModified && 
                                         locallyModified == true));
        if(sirff.ontologies){
          for(var i = 0; i < sirff.ontologies.length; i++){
            viewer.ontologyList.addItem({
              label:sirff.ontologies[i]
            });
          }
        }
        
        viewer.ontologySelecterStore.revert();
        var setupOntologySelecter = function(){
          for(var i = 0; i < viewer.client.allOntologies.length; i++){
            viewer.ontologySelecterStore.newItem(viewer.client.allOntologies[i]);
          }
        }
        if(viewer.client.allOntologies && viewer.client.allOntologies.length > 0){
          setupOntologySelecter();
        }else{
          viewer.client.updateResourceSet({
            resourcetype:"ontology",
            onSuccess:setupOntologySelecter,
            onError:function(err){
              viewer._error(err.responseText);
            }
          });
        }
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },

  /* Clears the formlet from this viewer.
   */
  clear:function(){
    this.currentFormlet = null,
    this.aclBox.clear();
    this.nameHeader.innerHTML = "Formlet: ";
    this.editorCP.setContent("");
    this.mainView.selectChild(this.editorCP);
    this.copyButton.setAttribute("disabled",true);
    this.deleteButton.setAttribute("disabled",true);
    this.saveButton.setAttribute("disabled",true);
    this.revertButton.setAttribute("disabled",true);
    this.ontologySelecterAddButton.setAttribute("disabled",true);
    this.ontologySelecterDeleteButton.setAttribute("disabled",true);
    this.ontologyList.clear();
  },

  /* Will clear this viewer and display the error message message.
   */
  _error:function(message){
    this.clear();
    this.editorCP.setContent(message);
    this.mainView.selectChild(this.editorCP);
  },

  /* Attempts to create a copy, with name given by this.copyNameInput, of the currently viewed formlet.
   * Will call this.onCopyCallback if present.
   */
  _copyFormSubmit:function(evt){
    evt.preventDefault();
    if(this.currentFormlet == null || this.copyNameInput.value == ""){
      return;
    }
    var viewer = this;
    this.client.newFormlet(viewer.copyNameInput.value,{
      onSuccess:function(){
        /* Copy */
        /* Update local representation */
        for(var i = 0; i < viewer.client.allFormlets.length; i++){
          if(viewer.client.allFormlets[i].name == viewer.copyNameInput.value){
            break;
          }
        }
        for(var j = 0; j < viewer.client.allFormlets.length; j++){
          if(viewer.client.allFormlets[j].name == viewer.currentFormlet){
            break;
          }
        }
        viewer.client.allFormlets[i].sirff = dojo.clone(viewer.client.allFormlets[j].sirff);
        /* Save representation */
        viewer.client.saveResourceRepresentation({
          resourcetype:"formlet",
          resourcename:viewer.copyNameInput.value,
          onSuccess:function(){
            if(viewer.onCopyCallback){
              viewer.onCopyCallback();
            }
          },
          onError:function(err){
            viewer._error(err.responseText);
          }
        });
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
    this.mainView.selectChild(this.editorCP);
  },

  /* Will attempt to add an ontology to the local representation of the currently associated formlet
   * based on this.ontologySelecter.
   */
  _addOntology:function(){
    if(!this.ontologySelecter.isValid()){
      alert("Pick an ontology to add.");
      return;
    }
    var ontologyUrl = this.client.getServerUrl()+"/ontology/"+this.ontologySelecter.value;
    var index = this.client.indexOfResource({
      resourcetype:"formlet",
      resourcename:this.currentFormlet});
    if(!this.client.allFormlets[index].sirff.ontologies){
      this.client.allFormlets[index].sirff.ontologies = [];
    }
    /* Is the ontology already in the formlet? */
    for(var i = 0; i < this.client.allFormlets[index].sirff.ontologies.length; i++){
      if(this.client.allFormlets[index].sirff.ontologies[i] == ontologyUrl)
        break;
    }
    if(i == this.client.allFormlets[index].sirff.ontologies.length){ /* No, it wasn't */
      this.client.allFormlets[index].sirff.ontologies[
        this.client.allFormlets[index].sirff.ontologies.length] = ontologyUrl;
      this._contentChange();
      this.displayFormlet(this.currentFormlet);
    }
  },

  /* Attempts to delete the ontology currently selected in this.ontologyList from the currently
   * associated formlet. (From the local representation only.)
   */
  _deleteOntology:function(){
    if(this.ontologyList.getSelectedIndex() == -1){
      alert("Pick an ontology to remove.");
      return;
    }
    var ontologyUrl = this.ontologyList.getItem(this.ontologyList.getSelectedIndex()).label;
    var index = this.client.indexOfResource({
      resourcetype:"formlet",
      resourcename:this.currentFormlet});
    for(var i = 0; i < this.client.allFormlets[index].sirff.ontologies.length; i++){
      if(this.client.allFormlets[index].sirff.ontologies[i] == ontologyUrl){
        this.client.allFormlets[index].sirff.ontologies.splice(i,1);
        i--;
      }
    }
    this._contentChange();
    this.displayFormlet(this.currentFormlet);
  },

  /* Should be called whenever the local representation of the currently associated formlet strays
   * from the representation on server.
   */
  _contentChange:function(){
    this.saveButton.setAttribute("disabled",false);
    var index = this.client.indexOfResource({
      resourcetype:"formlet",
      resourcename:this.currentFormlet});
    this.client.allFormlets[index].locallyModified = true;
  }
});