dojo.provide("shame.formulator.SelectionList");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

/* A SelectionList is a list in which an array of javascript hashes are represented on-screen as
 * a list of labels. One label can be selected at a time by clicking.
 *
 *   --- The item hashes ---
 * The itme hashes may look however the user desires and contain whatever information which will be 
 * stored. The hash property "label" will be used as the label of the corresponding item. The hash
 * property "onSelect", if present, will be called as a function when the corresponding item is 
 * selected. The hash property "onDeselect", if present, will be called as a function when the item
 * is deselected. The hash property "onReselect", if present, will be called as a function when the item
 * in clicked when already selected.
 */
dojo.declare("shame.formulator.SelectionList",
             [dijit._Widget, dijit._Templated],
{
  templateString:"<div><div style=\"width:100%-(border-width);min-height:10px\" class=\"selectionlist\"><table style=\"width:100%\"><tbody dojoAttachPoint=\"_listDOM\"></tbody></table></div></div>",

  /* Contains hashes, each representing an item in the list.
   * This array is in the same order as the items are represented in the visible list.
   */
  _items:null,
  
  /* The index of the currently selected item.
   */
  _selectedIndex:-1,

  /* The number of elements in the list.
   */
  length:0,

  constructor:function(){
    this._items = [];
    this.length = 0;
  },
  postCreate:function(){
  },
  startup:function(){
  },
  
  /* Adds a new item corresponding to hash to the end of the list.
   * Throws an error if hash.label is undefined.
   */
  addItem:function(hash){
    if(!hash.label){
      throw ("No label property given for item "+dojo.toJson(hash));
    }
    var parentList = this;
    this._items[this._items.length] = hash;
    var row = document.createElement("tr");
    var item = document.createElement("td");
    item.className="selectionlistitem";
    item.id = "item"+hash.label;
    item.onmouseover = function(){
      this.style.borderColor='blue';
    };
    item.onmouseout = function(){
      this.style.borderColor=this.style.backgroundColor;
    };
    item.onclick=function(){
      parentList._click(this);
    };
    item.innerHTML = hash.label;
    row.appendChild(item);
    this._listDOM.appendChild(row);
    this.length++;
  },

  /* Removes from the list the item at index index (counting from 0).
   */
  removeItem:function(index){
    if(index >= 0 && index < this._items.length){
      this._items.splice(index,1);
      if(this._selectedIndex == index){
        this._selectedIndex = -1;
      }else if(this._selectedIndex > index){
        this._selectedIndex--;
      }
      this._listDOM.removeChild(this._listDOM.childNodes[index]);
      this.length--;
    }
  },

  /* Removes all items from the list.
   */
  clear:function(){
    while(this.length > 0){
      this.removeItem(0);
    }
  },

  /* Returns the hash of the item at index index (counting from 0).
   */
  getItem:function(index){
    return this._items[index];
  },

  /* Returns the index of the currently selected item, or -1 if no item is currently selected.
   */
  getSelectedIndex:function(){
    return this._selectedIndex;
  },

  /* Should be called when the item node is clicked
   */
  _click:function(node){
    var i = this._nodeToIndex(node);
    if(this._selectedIndex != i){ /* Otherwise user reclicked already selected item */
      if(this._selectedIndex != -1){
        this._listDOM.childNodes[this._selectedIndex].childNodes[0].className = "selectionlistitem";
        if(this._items[this._selectedIndex].onDeselect)
          this._items[this._selectedIndex].onDeselect();
      }
      this._selectedIndex = i;
      node.className = "selectionlistitemselected";
      if(this._items[i].onSelect)
        this._items[i].onSelect();
    }else{
      if(this._items[i].onReselect)
        this._items[i].onReselect();
    }
  },

  /* Takes a list item HTML DOM node and returns the corresponding list index.
   * Returns -1 if the node is not a list item.
   */
  _nodeToIndex:function(node){
    for(var i = 0; i < this._listDOM.childNodes.length; i++){
      if(node === this._listDOM.childNodes[i].childNodes[0]){
        return i;
      }
    }
    return -1;
  }
});