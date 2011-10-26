
/* A class providing methods to interact with a FormulatorServer, as well as properties representing
 * the server state as perceived by a client.
 */
dojo.provide("shame.formulator.ExplorerClient");

dojo.declare(
  "shame.formulator.ExplorerClient",
  null,
  {
    /* The location of the FormulatorServer with which this client is associated. The server should
     * be available at this.serverProtocol+"://"+this.serverHost+":"+this.serverPort.
     */
    serverProtocol:"https",
    serverHost:"unknown",
    serverPort:443,

    /* The username and password that will be used for authentication with the server. If username is
     * null the client will attempt communication with the server as an anonymous user.
     */
    username:null, /* string (cleartext) */
    password:null, /* string (cleartext) */

    /* An array containing hashes f each corresponding to a formlet on the server. 
     * A hash f has a string property "name".
     * If a SIRFF representation of the formlet has been fetched then the hash f has a hash property 
     * "sirff" containing the JSON/SIRFF representation and a string property "updated" containing the 
     * time at which the representation was fetched.
     * Possibly there will be a property f.permissions. The property, if present, will be a hash of
     * key/value pairs u/p such that u is the name of a user with the permissions p for the formlet
     * where p is an array of strings each being the name of a permission.
     * f.permissions will be updated by this.getFormletPermissions.
     * If the formlet representation has been modified or otherwise is known to differ from the 
     * representation on server f will have a property "locallyModified" which will be true.
     */
    allFormlets:[],

    /* An array containing hashes f each corresponding to a formlet on the server. 
     * A hash f has a string property "name".
     * If an application/rdf+xml representation of the ontology has been fetched then the hash f has 
     * a property "xml" containing the representation (as a xml text) and a string property 
     * "updated" containing the time at which the representation was fetched.
     * Possibly there will be a property f.permissions. The property, if present, will be a hash of
     * key/value pairs u/p such that u is the name of a user with the permissions p for the formlet
     * where p is an array of strings each being the name of a permission.
     * f.permissions will be updated by this.getFormletPermissions.
     * If the ontology representation has been modified or otherwise is known to differ from the 
     * representation on server f will have a property "locallyModified" which will be true.
     */
    allOntologies:[],

    /* An array containing hashes f each corresponding to a formlet on the server. 
     * A hash f has a string property "name".
     * Possibly there will be a property f.permissions. The property, if present, will be a hash of
     * key/value pairs u/p such that u is the name of a user with the permissions p for the formlet
     * where p is an array of strings each being the name of a permission.
     * f.permissions will be updated by this.getFormletPermissions.
     */
    allGroups:[],

    /* An array containing hashes f each corresponding to a formlet on the server. 
     * A hash f has a string property "name".
     * Possibly there will be a property f.permissions. The property, if present, will be a hash of
     * key/value pairs u/p such that u is the name of a user with the permissions p for the formlet
     * where p is an array of strings each being the name of a permission.
     * f.permissions will be updated by this.getFormletPermissions.
     */
    allUsers:[],

    /* Returns the index of a resource in this.allFormlets, this.allOntologies, this.allGroups or
     * this.allUsers. Returns -1 if the resource is not found.
     *
     * props.resourcename should give the name of the resource
     * props.resourcetype should give the type of the resource ("formlet", "ontology", "group" or 
     * "user")
     */
    indexOfResource:function(props){
      if(props.resourcetype == "formlet")
        var listName = "allFormlets";
      else if(props.resourcetype == "ontology")
        var listName = "allOntologies";
      else if(props.resourcetype == "group")
        var listName = "allGroups";
      else if(props.resourcetype == "user")
        var listName = "allUsers";
      for(var i = 0; i < this[listName].length; i++){
        if(this[listName][i].name == props.resourcename)
          break;
      }
      if(i == this[listName].length)
        i = -1;
      return i;
    },
    
    /* Attempts to contact the associated server to get a list of resources with which to update
     * this.allFormlets, this.allOntologies, this.allGroups or this.allUsers. Returns immediately.
     *
     * props.resourcetype determines which type of resource set to update
     * ("formlet", "ontology", "group" or "user").
     *
     * props.onSuccess : function()
     *   Callback function that will be called upon successful updating.
     * 
     * props.onError : function(err : Error)
     *   Callback function that will be called upon error. The error will be passed as the first 
     *   argument to the function.
     */
    updateResourceSet:function(props){
      var client = this;
      var request = {
        handleAs:"xml",
        headers:{
          Accept:"text/xml"
        }
      };
      if(props.resourcetype == "formlet"){
        request.url = this.getServerUrl()+"/formlets";
      }else if(props.resourcetype == "ontology"){
        request.url = this.getServerUrl()+"/ontologies";
      }else if(props.resourcetype == "group"){
        request.url = this.getServerUrl()+"/groups";
      }else if(props.resourcetype == "user"){
        request.url = this.getServerUrl()+"/users";
      }else{
        if(props.onError)
          props.onError({responseText:"Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.updateResourceSet."});
        else
          console.log("Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.updateResourceSet.");
      }
      if(this.username != null){
        request.headers.Authorization = client._getCredentials();
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        var resources = [];
        var resourceList = data.getElementsByTagName(props.resourcetype);
        if(props.resourcetype == "formlet"){
          var listName = "allFormlets";
        }else if(props.resourcetype == "ontology"){
          var listName = "allOntologies";
        }else if(props.resourcetype == "group"){
          var listName = "allGroups";
        }else if(props.resourcetype == "user"){
          var listName = "allUsers";
        }
        for(var f = 0; f < resourceList.length; f++){
          var name = resourceList[f].
          getElementsByTagName("name")[0].
          childNodes[0].nodeValue;
          resources[f] = {
            name:name
          }
          for(var i = 0; i < client[listName].length; i++){
            if(client[listName][i].name == name){
              resources[f] = client[listName][i];
            }
          }
        }
        client[listName] = resources;
        onSuccess();
      };
      dojo.xhrGet(request);
    },


    /* Attempts to contact the associated server to delete a resource. Returns immediately.
     *
     * props.resourcetype determines which type of resource to delete
     * ("formlet", "ontology", "group" or "user").
     *
     * props.resourcename should give the name of the resource to delete.
     *
     * props.onSuccess : function()
     *   Callback function that will be called upon successful deletion.
     * 
     * props.onError : function(err : Error)
     *   Callback function that will be called upon error. The error will be passed as the first 
     *   argument to the function.
     */
    deleteResource:function(props){
      var client = this;
      var request = {};
      if(props.resourcetype == "formlet"){
        request.url = this.getServerUrl()+"/formlet/"+props.resourcename;
      }else if(props.resourcetype == "ontology"){
        request.url = this.getServerUrl()+"/ontology/"+props.resourcename;
      }else if(props.resourcetype == "group"){
        request.url = this.getServerUrl()+"/group/"+props.resourcename;
      }else if(props.resourcetype == "user"){
        request.url = this.getServerUrl()+"/user/"+props.resourcename;
      }else{
        if(props.onError)
          props.onError({responseText:"Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.updateResourceSet."});
        else
          console.log("Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.updateResourceSet.");
      }
      if(this.username != null){
        request.headers = {
          "Authorization":client._getCredentials()
        };
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        if(props.resourcetype == "formlet"){
          var listName = "allFormlets";
        }else if(props.resourcetype == "ontology"){
          var listName = "allOntologies";
        }else if(props.resourcetype == "group"){
          var listName = "allGroups";
        }else if(props.resourcetype == "user"){
          var listName = "allUsers";
        }
        for(var i = 0; i < client[listName].length; i++){
          if(client[listName][i].name == props.resourcename){
            client[listName].splice(i,1);
            break;
          }
        }
        onSuccess();
      };
      dojo.xhrDelete(request);
    },
    
    /* Attempts to create a new formlet by the name name in the server.
     * The formlet will initially have a default representation.
     *
     * props.onSuccess will be called, if present,  as a function on successful creation.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    newFormlet:function(name,props){
      var client = this;
      var request = {
        url:this.getServerUrl()+"/formlets",
        content:{
          action:"new",
          name:name
        }
      };
      if(this.username != null){
        request.headers = {
          "Authorization":client._getCredentials()
        };
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        /* update the local formlet list */
        client.allFormlets[client.allFormlets.length] = {
          name:name
        };
        onSuccess();
      };
      dojo.xhrPost(request);
    },
    
    /* Attempts to create a new ontology by the name name in the server.
     * The ontology will initially have a default representation.
     *
     * props.onSuccess will be called, if present,  as a function on successful creation.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    newOntology:function(name,props){
      var client = this;
      var request = {
        url:this.getServerUrl()+"/ontologies",
        content:{
          action:"new",
          name:name
        }
      };
      if(this.username != null){
        request.headers = {
          "Authorization":client._getCredentials()
        };
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        /* update the local ontology list */
        client.allOntologyNames[client.allOntologyNames.length] = {name:name};
        onSuccess();
      };
      dojo.xhrPost(request);
    },

    /* Creates a client associated with a FormulatorServer. props will be mixed into the client
     * using dojo.mixin.
     */
    constructor:function(props){
      if(props){
        dojo.mixin(this,props);
      }
    },

    /* Gets the representation of a resource from the server and updates 
     * this.allFormlets if props.resourcetype is "formlet" or
     * this.allOntologies if props.resourcetype is "ontology".
     * Overwrites previous representation in the array if present.
     * For formlets the SIRFF representation will be fetched and stored in this.allFormlets[#].sirff.
     * For ontologies the application/rdf+xml representation will be fetched and stored in 
     * this.allOntologies[#].xml.
     *
     * props.resourcename should give the name of the resource.
     * props.resourcetype should give the type of the resource ("formlet" or "ontology")
     * props.onSuccess will be called as a function(repr) where repr is the representation
     * on successful fetching of the representation.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    updateResourceRepresentation:function(props){
      var client = this;
      if(props.resourcetype == "formlet"){
        var format = "json/sirff";
        var handleAs = "json";
        var listName = "allFormlets";
        var reprProp = "sirff";
      }else if(props.resourcetype == "ontology"){
        var format = "application/rdf+xml";
        var handleAs = "text";
        var listName = "allOntologies";
        var reprProp = "xml";
      }
      var request = {
        url:this.getServerUrl()+"/"+props.resourcetype+"/"+props.resourcename,
        handleAs:handleAs,
        headers:{
          "Accept":format
        }
      };
      if(this.username != null){
        request.headers.Authorization = client._getCredentials();
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        for(var i = 0; i < client[listName].length; i++){
          if(client[listName][i].name == props.resourcename){
            break;
          }
        }
        if(client[listName][i]){
          client[listName][i][reprProp] = data;
          client[listName][i].updated = (new Date()).toUTCString();
          client[listName][i].locallyModified = false;
        }else{
          client[listName][i] = {
            name:props.resourcename,
            updated:(new Date()).toUTCString()
          };
          client[listName][i][reprProp] = data;
        }
        onSuccess(data);
      };
      dojo.xhrGet(request);
    },
    
    /* Gets a representation for a resource. Uses the cache if available, otherwise uses 
     * this.updateResourceRepresentation.
     * For formlets the SIRFF representation is fetched.
     * For ontologies the application/rdf+xml representation is fetched.
     *
     * props.resourcename should give the name of the resource.
     * props.resourcetype should give the type of the resource ("formlet" or "ontology")
     * props.onSuccess will be called as a function(repr) where repr is the representation
     * on successful fetching of the representation.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    getResourceRepresentation:function(props){
      if(props.resourcetype == "formlet"){
        var listName = "allFormlets";
        var reprProp = "sirff";
      }else if(props.resourcetype == "ontology"){
        var listName = "allOntologies";
        var reprProp = "xml";
      }
      /* check if the representation is cached */
      for(var index = 0; index < this[listName].length; index++){
        if(this[listName][index].name == props.resourcename){
          if(this[listName][index][reprProp]){
            props.onSuccess(this[listName][index][reprProp]);
            return;
          }
          break;
        }
      }
      /* get the representation */
      this.updateResourceRepresentation(props);
    },

    /* Will attempt to update the server's representation of a resource with the
     * representation currently in this.allFormlets[#] or this.allOntologies.
     *
     * props.resourcename should be the name of the resource
     *
     * props.resourcetype should be the name of the type of the resource ("formlet" or "ontology")
     *
     * props.onSuccess will be called as a function() on successful update.
     *
     * props.onError will be called as a function(err) where err is the error upon error.
     */
    saveResourceRepresentation:function(props){
      var client = this;
      if(props.resourcetype == "formlet"){
        var listName = "allFormlets";
        var contentType = "json/sirff";
      }else if(props.resourcetype == "ontology"){
        var listName = "allOntologies";
        var contentType = "application/rdf+xml; charset=UTF-8";
      }
      /* Find the formlet */
      for(var index = 0; index < client[listName].length; index++){
        if(client[listName][index].name == props.resourcename)
          break;
      }
      if(index == client[listName].length){
        onError({responseText:"No such resource."});
        return;
      }
      if(props.resourcetype == "formlet"){
        var repr = dojo.toJson(client[listName][index].sirff);
      }else if(props.resourcetype == "ontology"){
        var repr = client[listName][index].xml;
      }
      var request;
      try {
        request = new ActiveXObject('Msxml2.XMLHTTP');
      }catch (e){
        try {
          request = new ActiveXObject('Microsoft.XMLHTTP');
        }catch (e2){
          try {
            request = new XMLHttpRequest();
          }catch (e3) {
            onError({responseText:"Browser does not support XHR."});
            return;
          }
        }
      }
      var onSuccess = function(){};
      var onError = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          onError = props.onError;
      }
      request.onreadystatechange = function(){
        if(request.readyState == 4){ /* XMLHttpRequest.DONE */
          if(request.status == 200){
            client[listName][index].locallyModified = false;
            onSuccess();
          }else{
            onError(request);
          }
        }
      }
      request.open("PUT",this.getServerUrl()+"/"+props.resourcetype+"/"+props.resourcename,true);
      if(!request.setRequestHeader){
        onError({responseText:"Browser does not support XMLHttpRequest.setRequestHeader."});
        return;
      }
      request.setRequestHeader("Content-Type",contentType);
      if(this.username != null)
        request.setRequestHeader("Authorization",client._getCredentials());

      request.send(repr);
    },

    /* Gets the permissions for a resource and updates 
     * this.allFormlets if props.resourcetype is "formlet",
     * this.allOntologies if props.resourcetype is "ontology",
     * this.allGroups if props.resourcetype is "group" or
     * this.allUsers if props.resourcetype is "user".
     *
     * props.resourcetype should give the type of the resource ("formlet", "ontology", "group" or 
     * "user").
     * props.resourcename should give the name of the resource.
     * props.onSuccess will be called as a function(p) where p is a hash of key/value pairs u/p such that
     * u is the name of a user with the permissions p for the formlet  where p is an array of strings 
     * each being the name of a permission on successful fetching of the permissions.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    getPermissions:function(props){
      /* check support for resourcetype */
      if(props.resourcetype != "formlet" &&
         props.resourcetype != "ontology" &&
         props.resourcetype != "group" &&
         props.resourcetype != "user"){
        if(props.onError){
          props.onError({responseText:"Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.getPermissions."});
        }else{
          console.log("Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.getPermissions.");
        }
        return;
      }

      if(props.resourcetype == "formlet"){
        var listName = "allFormlets";
      }else if(props.resourcetype == "ontology"){
        var listName = "allOntologies";
      }else if(props.resourcetype == "group"){
        var listName = "allGroups";
      }else if(props.resourcetype == "user"){
        var listName = "allUsers";
      }

      /* check if the permissions are cached */
      for(var index = 0; index < this[listName].length; index++){
        if(this[listName][index].name == props.resourcename){
          if(this[listName][index].permissions){
            props.onSuccess(this[listName][index].permissions);
            return;
          }
          break;
        }
      }
      /* get the permissions */
      var client = this;
      var request = {
        url:this.getServerUrl()+"/permissions/"+props.resourcetype+"/"+props.resourcename,
        handleAs:"xml",
        headers:{
          Accept:"text/xml"
        }
      };
      if(this.username != null){
        request.headers.Authorization = client._getCredentials();
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }
      request.load = function(data,args){
        for(var i = 0; i < client[listName].length; i++){
          if(client[listName][i].name == props.resourcename){
            break;
          }
        }
        var p = client._extractPermissions(data);
        if(client[listName][i]){
          client[listName][i].permissions = p;
        }else{
          client[listName][i] = {
            name:props.resourcename,
            permissions:p
          };
        }
        onSuccess(p);
      };
      dojo.xhrGet(request);
    },

    /* Grants or revokes a permissions for a resource and updates 
     * this.allFormlets if props.resourcetype is "formlet",
     * this.allOntologies if props.resourcetype is "ontology"
     * this.allGroups if props.resourcetype is "group",
     * this.allUsers if props.resourcetype is "user".
     *
     * props.action should be "grant" to grant the permission or "revoke" to revoke the permission
     * props.resourcetype should give the type of the resource ("formlet", "ontology", "group" or 
     * "user").
     * props.resourcename should give the name of the resource.
     * props.grantee should give the name of the user or group from which to revoke the permission
     * props.permission should give the name of the permission to revoke
     * props.onSuccess will be called as a function() on successful revokation.
     * props.onError will be called, if present, as a function(err) where err is the error upon error.
     */
    changePermission:function(props){
      /* check support for resourcetype */
      if(props.resourcetype != "formlet" &&
         props.resourcetype != "ontology" &&
         props.resourcetype != "group" &&
         props.resourcetype != "user"){
        if(props.onError){
          props.onError({responseText:"Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.changePermission."});
        }else{
          console.log("Resource type \""+props.resourcetype+"\" is not supported by ExplorerClient.changePermission.");
        }
        return;
      }
      var client = this;
      var request = {
        url:this.getServerUrl()+"/permissions/"+props.resourcetype+"/"+props.resourcename,
        content:{
          action:props.action,
          group:props.grantee,
          targetaction:props.permission
        }
      };
      if(this.username != null){
        request.headers = {
          "Authorization":client._getCredentials()
        };
      }
      var onSuccess = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          request.error = props.onError;
      }

      request.load = function(data,args){
        if(props.resourcetype == "formlet"){
          var listName = "allFormlets";
        }else if(props.resourcetype == "ontology"){
          var listName = "allOntologies";
        }else if(props.resourcetype == "group"){
          var listName = "allGroups";
        }else if(props.resourcetype == "user"){
          var listName = "allUsers";
        }
        for(var i = 0; i < client[listName].length; i++){
          if(client[listName][i].name == props.resourcename){
            /* Update the cached permissions */
            if(props.action == "grant"){
              if(client[listName][i].permissions && client[listName][i].permissions[props.grantee]){
                for(var j = 0; j < client[listName][i].permissions[props.grantee].length; j++){
                  if(client[listName][i].permissions[props.grantee][j] == props.permission)
                    break;
                }
                client[listName][i].permissions[props.grantee][j] = props.permission;
              }else{
                if(!client[listName][i].permissions){
                  client[listName][i].permissions = {};
                }
                client[listName][i].permissions[props.grantee] = [props.permission];
              }
            }else if(props.action == "revoke"){
              if(client[listName][i].permissions && client[listName][i].permissions[props.grantee]){
                for(var j = 0; j < client[listName][i].permissions[props.grantee].length; j++){
                  if(client[listName][i].permissions[props.grantee][j] == props.permission){
                    client[listName][i].permissions[props.grantee].splice(j,1);
                    j--;
                  }
                }
              }/* else nothing to remove */
            }
            break; /* names are unique - there are no more matches */
          }
        }
        onSuccess();
      };
      
      dojo.xhrPost(request);
    },
    
    /* Determines whether or not the username/password pair props.usr/props.pass is a proper login.
     * Uses {FormulatorServer}/authentication to this end.
     *
     * props.usr should be the username
     * props.pass should be the password
     * props.onSuccess will be called as a function() upon successful authentication
     * props.onFailure will be called as a function() upon successful authentication procedure but
     *   failed authentication.
     * props.onError will be called as a function(err) where err is the error on error
     */
    isAuthentic:function(props){
      var client = this;
      var request = {
        url:this.getServerUrl()+"/authentication",
        handleAs:"text",
        headers:{
          "Authorization":"Basic "+this._base64encode(props.usr+":"+props.pass)
        }
      };
      var onSuccess = function(){};
      var onError = function(){};
      var onFailure = function(){};
      if(props){
        if(props.onSuccess)
          onSuccess = props.onSuccess;
        if(props.onError)
          onError = props.onError;
        if(props.onFailure)
          onFailure = props.onFailure;
      }
      request.load = function(data,args){
        onSuccess();
      };
      request.error = function(err){
        if(err.status == 401)
          onFailure();
        else
          onError(err);
      };
      dojo.xhrGet(request);
    },

    /* Returns the base URL to the associated FormulatorServer.
     */
    getServerUrl:function(){
      return this.serverProtocol+"://"+this.serverHost+":"+this.serverPort;
    },

    /* Debug prints an XMLDocument
     */
    _printXMLDocument:function(data){
        var printNode = function(node,ind,parent){
          var name = parent+"."+node.nodeName;
          console.log(ind+name+" : "+node.nodeValue);
          var i;
          if(node.nodeType == 1){
            for(i = 0; i < node.childNodes.length; i++){
              printNode(node.childNodes[i],ind+"  ",name);
            }
          }
        }
        var i;
        for(i = 0; i < data.documentElement.childNodes.length; i++)
          printNode(data.documentElement.childNodes[i],"  ",data.documentElement.nodeName);
    },

    /* Returns an appropriate value for the Authorization HTTP header.
     *
     * Assumes that username and password are non-null strings, and that username does not contain
     * any colon (':') characters.
     */
    _getCredentials:function(){
      return "Basic "+this._base64encode(this.username+":"+this.password);
    },

    /* Returns a base64 encoding of string's utf-8 encoding.
     */
    _base64encode:function(string){
      return dojox.encoding.base64.encode(this._utf8encode(string));
    },
    
    /* Returns a byte array representing string utf-8 encoded.
     */
    _utf8encode:function(string){
      var utf8 = [];
      var j = 0;
      for(var i = 0; i < string.length; i++){
        var c = string.charCodeAt(i); /* unicode char code */
        if(c < 128){
          utf8[j] = c; j++;
        }else if(c < 2048){
          utf8[j] = (0xc0 | Math.floor(c / 64)); j++;
          utf8[j] = (0x80 | Math.floor(c % 64)); j++;
        }else if(c < 65536){
          utf8[j] = (0xe0 | Math.floor(c / 4096)); j++;
          utf8[j] = (0x80 | Math.floor((c % 4096) / 64)); j++;
          utf8[j] = (0x80 | Math.floor(c % 64)); j++;
        }else{
          utf8[j] = (0xf0 | Math.floor(c / 262144)); j++;
          utf8[j] = (0x80 | Math.floor((c % 262144) / 4096)); j++;
          utf8[j] = (0x80 | Math.floor((c % 4096) / 64)); j++;
          utf8[j] = (0x80 | Math.floor(c % 64)); j++;
        }
      }
      return utf8;
    },

    /* Builds and returns a hash of key/value pairs u/p such that u is the name of a user who has the
     * permissions p for something where p is an array of strings each being the name of a permission. 
     * This is provided that xml is the XML representation of the same
     * permission set according to the schema used by the formulator server to this end.
     */
    _extractPermissions:function(xml){
      var p = {};
      for(var g = 0; g < xml.documentElement.childNodes.length; g++){
        var gPerms = [];
        var gName = "unknown";
        for(var i = 0; i < xml.documentElement.childNodes[g].childNodes.length; i++){
          if(xml.documentElement.childNodes[g].childNodes[i].nodeName == "name"){
            gName = xml.documentElement.childNodes[g].childNodes[i].childNodes[0].nodeValue;
          }else if(xml.documentElement.childNodes[g].childNodes[i].nodeName == "permission"){
            gPerms[gPerms.length] = xml.documentElement.childNodes[g].childNodes[i].childNodes[0].nodeValue;
          }
        }
        for(var i = 0; i < gPerms.length; i++){
          p[gName] = gPerms;
        }
      }
      return p;
    }
  }
);