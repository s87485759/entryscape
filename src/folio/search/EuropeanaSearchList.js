/*global dojo, dijit, folio*/
/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.search.EuropeanaSearchList");
dojo.require("folio.data.List"); //Contains the AbstractList.
dojo.require("dojox.xml.DomParser");
dojo.require("folio.util.Dialog");
dojo.require("folio.editor.RFormsPresenter");
 
dojo.declare("folio.search.EuropeanaSearchList", folio.data.AbstractList, {
	constructor: function(entry, params) {
		this.params = params;
		this.user = __confolio.application.getUser();
		if (this.user && this.user.homecontext) {
			this.homeContext = this.user.homecontext;
		}
	},
	constructSearchUrl: function() {
		//return "europeanatest.json";
		var types = "";
		if(this.params.types.length !== 0){
			if(this.params.types.length > 1){
				types = (this.params.term != null ? "+AND+": "")+"(";
				for(i in this.params.types){
					types += "europeana_type:"+this.params.types[i];
					if(i < this.params.types.length-1){
						types += "+OR+";
					}
				}
				types += ")";
			} else if(this.params.types.length === 1){
				types = (this.params.term != null ? "+AND+": "")+"europeana_type:"+this.params.types[0];
			}
		}

		return "http://api.europeana.eu/api/opensearch.rss?searchTerms="+this.params.term+types+"&wskey=BYOXSVLSSU";
	},
	loadChildren: function(limit, offset, onChildren, onError) {
		if (this._detectMissing(limit, offset)) {
			__confolio.application.getCommunicator().loadViaSCAMProxy({url: this.constructSearchUrl(), handleAs: "text", onSuccess: dojo.hitch(this, function(xmlStr) {
					var jsdom = dojox.xml.DomParser.parse(xmlStr);
					var result = jsdom.byName("item");
					this.size = result.length; //correct?
	  				for (var i = 0; i < result.length; i++) {
	    				var fentry = result[i];
						var enclosure = fentry.byName("enclosure");
						var link = fentry.byName("link")[0].childNodes[0].nodeValue;
						var resourceUri = enclosure.length > 0 ? enclosure[0].attributes[0].nodeValue : link.substring(0, link.indexOf(".srw?wskey"))+".html";
						var childE = this.entry.getContext().createLinkReference(resourceUri, link, folio.data.BuiltinTypeSchema.NONE);
						childE.readAccessToMetadata = true;
						childE.readAccessToResource = true;
						var title = fentry.byName("title"), description = fentry.byName("description")
						if (title.length > 0) {
							childE.localMetadata.create(resourceUri, folio.data.DCSchema.TITLE, {type: "literal", value: title[0].childNodes[0].nodeValue});
						}
						if (description.length > 0) {
							childE.localMetadata.create(resourceUri, folio.data.DCSchema.DESCRIPTION, {type: "literal", value: description[0].childNodes[0].nodeValue});
						}
						var etype = fentry.byName("europeana:type")[0].childNodes[0].nodeValue;
						childE.localMetadata.create(resourceUri, folio.data.DCTermsSchema.FORMAT, {type: "literal", value: etype.toLowerCase()});
						
						childE._constructPreview = dojo.hitch(this, function(ent, node) {
							var prepareDialog = function(tooltipdialog) {
								//TODO, load full metadata via proxy
								var newNode = dojo.create("div");
								var pres = new folio.editor.RFormsPresenter({}, dojo.create("div", null, newNode));
								__confolio.application.getCommunicator().loadViaSCAMProxy({
										url: ent.getExternalMetadataUri(), 
										from: "europeana", 
										onSuccess: function(data) {
											ent.localMetadata = new rdfjson.Graph(dojo.clone(data));
											var stmts = graph.find(null, folio.data.DCSchema.TITLE, null);
											ent.resourceUri = stmts[0].getSubject();
											pres.show(ent, false);
											tooltipdialog.setContent(newNode);
								
											//Make sure that someDijit is finished rendering, or at least has some realistic size before makeing the next call.
											dijit.focus(pres.domNode);
											tooltipdialog.openPopup();
										}});
							};
							folio.util.createToolKitDialog(node, prepareDialog);
						}, childE);
						
						if (this.homeContext) {
							childE._addToFolio = dojo.hitch(this, function(ent, node) {
								dojo.connect(node, "onclick", this, function() {
									
									var context = __confolio.application.getStore().getContextById(this.homeContext);
									
									__confolio.application.getCommunicator().loadViaSCAMProxy({
										url: ent.getExternalMetadataUri(), 
										from: "europeana", 
										onSuccess: function(data) {
											var graph = new rdfjson.Graph(dojo.clone(data));
											var stmts = graph.find(null, folio.data.DCSchema.TITLE, null);
											var resourceUri = stmts[0].getSubject();
											context.createEntry({
													cachedExternalMetadata: data,
													params: {
																listURI: context.getBase()+context.getId()+"/entry/_top",
																resource: encodeURIComponent(resourceUri),
															 	"cached-external-metadata": encodeURIComponent(ent.getExternalMetadataUri()),
															 	representationType: "informationresource",
															 	locationType: "reference",
															 	builtinType: "none"															 
															 }
												}, 
												function() {
													alert("Item added to your portfolio.");
												}, 
												function(mesg) {
													alert("Something went wrong, sorry in Beta mode here.\nTest with another item.");
												});
										}
									});
								});
							}, childE);							
						}

						
		    			this.childrenE[offset+i] = childE;
			  		}

					if (limit == -1) {
						this.missing = false;
					} else {
						delete this.missing;
					}
					
					if (result.length != offset+limit) {
						this.size = offset+result.length;
						this.loadedSize = this.size;
					} else {
						this.loadedSize = result.length;
					}

					onChildren(this._getChildrenSlice(offset, limit));
			})});
		} else {
			onChildren(this._getChildrenSlice(offset, limit));
		}
	},
	canBeSorted: function() {
		return false;
	},
	isSorted: function() {
		return false;
	}
});