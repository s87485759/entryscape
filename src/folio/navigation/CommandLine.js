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

dojo.provide("folio.navigation.CommandLine");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.form.TextBox");

/**
 * Provides a simple CLI UI, a input field on the top and a result area below.
 * The result area are cleaned and updated after every command, no history is preserved.
 * Currently supports cd, pwd, cat, and ls.
 * @see folio.navigation.FDO
 */
dojo.declare("folio.navigation.CommandLine", [dijit.layout._LayoutWidget, dijit._Templated], {	 
	//=================================================== 
	// Inherited Attributes 
	//=================================================== 
	templatePath: dojo.moduleUrl("folio.navigation", "CommandLineTemplate.html"),
	widgetsInTemplate: true,
	 
	//=================================================== 
	// Inherited methods 
	//=================================================== 
	resize: function(size) {
		this.inherited("resize", arguments);
		this.CLILayoutDijit.resize();
	},
	
	postCreate: function() {
		this.containerNode = this.domNode;
		this.inherited("postCreate", arguments);
		this.connect(this.promptDijit.domNode, "onkeyup", dojo.hitch(this, function(evt) {
				if (evt.keyCode == dojo.keys.ENTER) {
					this._doCommand();
				}
			}));
		this.promptDijit.focus();
	},
	 
	//=================================================== 
	// Private methods 
	//===================================================	
	_doCommand: function() {
		var command = this.promptDijit.attr("value");
		var commandArr = command.split(' ');
		switch(commandArr[0]) {
			case "ls":
				this.fdo.ls(dojo.hitch(this, function(children) {
					var arr = dojo.map(children, function(child) {
						return "<tr><td>"+child.getId()+"</td><td>" +folio.data.getLabel(child)+"</td></tr>";
					});
					this.resultDijit.attr("content", "<table>"+arr.join("")+"</table>");
				}));
				break;
			case "cd":
				this.fdo.cd(commandArr[1], dojo.hitch(this, function(result) {
					switch(result) {
						case folio.navigation.FDO.code.SUCCESS:
							this.resultDijit.attr("content", "Changing directory.");
							break;
						case folio.navigation.FDO.code.FAILURE:
							this.resultDijit.attr("content", "Failed changing directory, did not understand parameter "+commandArr[1]);
							break;
					};
				}));
			case "pwd":
				var current = this.fdo.wd();
				this.resultDijit.attr("content", ""+current.getId()+"&nbsp;&nbsp;" +folio.data.getLabel(current));
				break;
			case "cat":
				this.fdo.get(commandArr[1], dojo.hitch(this, function(entry) {
					if (entry) {
						var str = "<b>Entry uri&nbsp;:</b>&nbsp;&nbsp;"+entry.getUri()+"\n<hr>"
								+ "<h1>Metadata</h1><pre>"+dojo.toJson(entry.getMetadata().getRoot(), true)+"</pre>"
								+ "<h1>External Metadata</h1>" + (entry.getExternalMetadata() ? "<pre>"+dojo.toJson(entry.getMetadata().getRoot(), true)+"</pre>" : "No External metadata")
								+ "<h1>Entry Information</h1><pre>"+dojo.toJson(entry.getInfo().getRoot(), true)+"</pre>";
						this.resultDijit.attr("content", str);
					} else {
						this.resultDijit.attr("content", "No entry found for '"+commandArr[1]+"'.");						
					}
				}));
				break;
			default:
				this.resultDijit.attr("content", "Did not understand the command '"+command+"'.");
			break;
		}
	}
});