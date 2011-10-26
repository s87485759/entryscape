dojo.provide("shame.formulator.OntologyViewer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.Toolbar");
dojo.require("shame.formulator.ACLBox");

dojo.declare("shame.formulator.OntologyViewer", [dijit._Widget, dijit._Templated], {
  templatePath:dojo.moduleUrl("shame.formulator","OntologyViewerTemplate.html"),
  widgetsInTemplate:true,

  /* The client that will be used to communicate with the Formulator Server
   */
  client:null,

  /* The name of the ontology currently associated with this viewer. Will be null if no ontology is
   * associated with this viewer.
   */
  currentOntology:null,

  /* A function that will, if present, be called when the ontology associated with this viewer is
   * deleted via this viewer.
   */
  onDeleteCallback:null,
  
  /* props will be mixed into this object using dojo.mixin.
   */
  constructor:function(props){
    dojo.mixin(this,props);
  },

  postCreate:function(){
    this.deleteButton.setAttribute("disabled",true);
    this.saveButton.setAttribute("disabled",true);
    this.revertButton.setAttribute("disabled",true);
    this.aclBox.client = this.client;
    var viewer = this;
    dojo.connect(this.ontologyContent,"onblur",function(evt){
      viewer._contentBlur(evt)
    });
  },

  /* Loads and displays the ontology by the name name from this.client.
   */
  displayOntology:function(name){
    var viewer = this;
    this.mainBorderContainer.layout();
    this.client.getResourceRepresentation({
      resourcetype:"ontology",
      resourcename:name,
      onSuccess:function(data){
        viewer.clear();
        viewer.currentOntology = name;
        viewer.deleteButton.setAttribute("disabled",false);
        viewer.revertButton.setAttribute("disabled",false);
        var locallyModified = viewer.client.allOntologies[viewer.client.indexOfResource({
          resourcetype:"ontology",
          resourcename:name
        })].locallyModified;
        viewer.saveButton.setAttribute("disabled",locallyModified != true);
        viewer.ontologyNameHeader.innerHTML = "Ontology: "+name;
        viewer.aclBox.load({
          resourcetype:"ontology",
          resourcename:name,
          onError:function(err){ viewer._error(err.responseText); }
        });
        viewer.ontologyContent.value = data;
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },

  /* Clears the ontology from this viewer.
   */
  clear:function(){
    this.errorDiv.innerHTML = "";
    this.deleteButton.setAttribute("disabled",true);
    this.saveButton.setAttribute("disabled",true);
    this.revertButton.setAttribute("disabled",true);
    this.ontologyNameHeader.innerHTML = "Ontology: ";
    this.ontologyContent.value = "";
    this.aclBox.clear();
  },

  /* Deletes the ontology currently associated with this viewer. On success calls this.onDeleteCallback
   * if present.
   */
  _deleteOntology:function(){
    var viewer = this;
    this.client.deleteResource({
      resourcetype:"ontology",
      resourcename:viewer.currentOntology,
      onSuccess:function(){
        viewer.clear();
        if(viewer.onDeleteCallback && viewer.onDeleteCallback != null){
          viewer.onDeleteCallback();
        }
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },

  /* Attempts to save the representation of the currently associated ontology currently in 
   * this.client.allOntologies to the server.
   */
  _saveOntology:function(){
    var viewer = this;
    this.client.saveResourceRepresentation({
      resourcetype:"ontology",
      resourcename:this.currentOntology,
      onSuccess:function(){
        viewer.saveButton.setAttribute("disabled",true);
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },
  
  /* Fetches the representation of the currently associated ontology from the server and updates the
   * local version.
   */
  _revertOntology:function(){
    var viewer = this;
    this.client.updateResourceRepresentation({
      resourcetype:"ontology",
      resourcename:this.currentOntology,
      onSuccess:function(xml){
        viewer.ontologyContent.value = xml;
        viewer.saveButton.setAttribute("disabled",true);
      },
      onError:function(err){
        viewer._error(err.responseText);
      }
    });
  },

  /* Handler for this.ontologyContent.onBlur
   */
  _contentBlur:function(){
    /* save content in textarea to this.client.allOntologies */
    var i = this.client.indexOfResource({
      resourcetype:"ontology",
      resourcename:this.currentOntology
    });
    if(this.client.allOntologies[i].xml || this.ontologyContent.value != ""){
      if(this.client.allOntologies[i].xml != this.ontologyContent.value){
        this.client.allOntologies[i].xml = this.ontologyContent.value;
        this.client.allOntologies[i].locallyModified = true;
        this.saveButton.setAttribute("disabled",false);
      }
    }
  },

  /* Clears this viewer and displays the error message message.
   */
  _error:function(message){
    this.clear();
    this.errorDiv.innerHTML = message;
  }
});