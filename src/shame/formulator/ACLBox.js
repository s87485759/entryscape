
dojo.provide("shame.formulator.ACLBox");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("shame.formulator.SelectionList");
dojo.require("shame.formulator.ExplorerClient");
dojo.require("dojo.data.ItemFileWriteStore");

/* A Box displaying and allowing manipulation of the permissions for a formulator server managed
 * resource: a formlet, ontology, group or user.
 */
dojo.declare("shame.formulator.ACLBox", [dijit._Widget, dijit._Templated],
{
  templatePath:dojo.moduleUrl("shame.formulator", "ACLBoxTemplate.html"),
  widgetsInTemplate: true,

  /* The ExplorerClient to use for server communication.
   */
  client: null,

  /* The resource to which this ACLBox is associated is the one of resource type this.resourcetype
   * ("formlet", "ontology", "group" or "user") and name this.resourcename.
   */
  resourcetype: null,
  resourcename: null,

  granteeSelect: null,
  granteeStore: null,

  /* args will be mixed into this object using dojo.mixin.
   *
   * Appropriate:
   * args.client
   */
  constructor:function(args){
    dojo.mixin(this,args);
  },

  postCreate:function(){
    this.granteeStore = new dojo.data.ItemFileWriteStore({data:{
      identifier:'name',
      label:'name',
      items:[
      ]
    }});
    store = this.granteeStore;
    this.granteeSelect = new dijit.form.FilteringSelect({store:store,ignoreCase:false,regExp:".*",autoComplete:false},this.granteeSelectDOM);
  },

  /* Initialises the ACLBox for the resource of type args.resourcetype ("formlet","ontology","group" or 
   * "user") by the name args.resourcename.
   * On error args.onError will be called, if present, as a function(err) where err is the error
   */
  load:function(args){
    this.resourcetype = args.resourcetype;
    this.resourcename = args.resourcename;
    var acl = this;
    this.client.getPermissions({
      resourcetype:this.resourcetype,
      resourcename:this.resourcename,
      onSuccess:function(permissions){
        acl.clear();
        for(groupName in permissions){
          for(var i = 0; i < permissions[groupName].length; i++){
            acl.aclList.addItem({label:groupName+" : "+permissions[groupName][i],
                                 grantee:groupName,
                                 permission:permissions[groupName][i]});
          }
        }
      },
      onError:args.onError
    });
    this.granteeStore.revert(); /* empty user/group selection */
    var addUsers = function(){
      for(var i = 0; i < acl.client.allUsers.length; i++){
        acl.granteeStore.newItem({name:"User: "+acl.client.allUsers[i].name,
                                  grantee:acl.client.allUsers[i].name});
      }
    }
    var addGroups = function(){
      for(var i = 0; i < acl.client.allGroups.length; i++){
        acl.granteeStore.newItem({name:"Group: "+acl.client.allGroups[i].name,
                                  grantee:acl.client.allGroups[i].name});
      }
    }
    if(acl.client.allUsers.length == 0){
      acl.client.updateResourceSet({
        resourcetype:"user",
        onSuccess:function(){
          addUsers();
        },
        onError:args.onError
      });
    }else{
      addUsers();
    }
    if(acl.client.allGroups.length == 0){
      acl.client.updateResourceSet({
        resourcetype:"group",
        onSuccess:function(){
          addGroups();
        },
        onError:args.onError
      });
    }else{
      addGroups();
    }
  },

  /* Clears the ACLBox.
   */
  clear:function(){
    this.aclList.clear();
  },

  /* Based on the items selected in this.granteeSelect and this.permissionSelect grants the 
   * corresponding permission to the corresponding user/group.
   */
  _aclGrant:function(){
    if(this.granteeSelect.item == null || this.permissionSelect.value == ""){
      alert("Select a user/group and a permission to grant from the selection boxes.");
      return;
    }
    var acl = this;
    /* Make the ACLList blink to make the interface feel more responsive */
    dojo.fadeOut({node:this.aclList.domNode,
                  duration:100,
                  onEnd:function(){
                    dojo.fadeIn({node:acl.aclList.domNode,duration:100}).play();
                  }}).play();

    this.client.changePermission({
      action:"grant",
      resourcename:this.resourcename,
      resourcetype:this.resourcetype,
      grantee:this.granteeSelect.item.grantee,
      permission:this.permissionSelect.value,
      onSuccess:function(){
        acl.load({resourcetype:acl.resourcetype,resourcename:acl.resourcename,
                  onError:function(){
                    alert("Failed to reload permissions.");
                  }});
      },
      onError:function(){
        alert("Failed to grant permission.");
      }
    });
  },

  /* Based on the item selected in this.aclList revokes the corresponding permission for the 
   * associated resource.
   */
  _aclRevoke:function(){
    if(this.aclList.getSelectedIndex() == -1){
      alert("Select a permission to revoke.");
      return;
    }
    var item = this.aclList.getItem(this.aclList.getSelectedIndex());
    var acl = this;
    /* Make the ACLList blink to make the interface feel more responsive */
    dojo.fadeOut({node:this.aclList.domNode,
                  duration:100,
                  onEnd:function(){
                    dojo.fadeIn({node:acl.aclList.domNode,duration:100}).play();
                  }}).play();

    this.client.changePermission({
      action:"revoke",
      resourcename:this.resourcename,
      resourcetype:this.resourcetype,
      grantee:item.grantee,
      permission:item.permission,
      onSuccess:function(){
        acl.load({resourcetype:acl.resourcetype,resourcename:acl.resourcename,
                   onError:function(){
                     alert("Failed to reload permissions.");
                   }});
      },
      onError:function(){
        alert("Failed to revoke permission.");
      }
    });
  }
  
  
});