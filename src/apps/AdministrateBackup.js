/*
 * Copyright (c) 2007-2011
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

dojo.provide("folio.apps.AdministrateBackup");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.TimeTextBox");

/**
 * This class serves the purposes of handling the admin user interface
 * where configuration for backups are managed. No foreseen cases of reuse
 * has been seen and therefore almost all methods are "private"
 * 
 * In the user interface either a one time backup or a periodic backup can
 * be configured. To switch between these two configuration options two 
 * radio-buttons are used in the GUI 
 */
dojo.declare("folio.apps.AdministrateBackup", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "AdministrateBackupTemplate.html"),
    widgetsInTemplate: true,
	
	baseURI: "", // 
	isPeriodic: true,
	
	show: function(params) {
		/*if (params.entry == null && params.context == null) {
			params.context = this.startContext;
			params.entry = "_top";
		}*/
		//dojo.publish("/confolio/showEntry", [{entry: params.entry, context: params.context, list: params.list}]);		
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.application = __confolio.application;
		this.baseURI = this.application.getRepository();
		this._loadBackupConfig();
		// Force the user to login
		//Using a try catch due to some uncatched throw in the show method in dialog.
		try {
			var ldialog = new folio.security.LoginDialog({application: this.application, username: "admin"});
			ldialog.show();
		} catch (e) {
			console.log(e)
		}
	},
	//===================================================
	// Methods used by both views
	//===================================================
	/*
	 * Switch between the different views (periodic or one-time configuration)
	 */
	_editorUpdate: function(showOneTimeBackup){
		if(showOneTimeBackup){
			dojo.style(this.periodicEditorDijit.domNode, "display", "none");
			dojo.style(this.oneTimeBackupEditorDijit.domNode, "display", "block");
		} else {
			dojo.style(this.oneTimeBackupEditorDijit.domNode, "display", "none");
			dojo.style(this.periodicEditorDijit.domNode, "display", "block");
		}
		this.isPeriodic = !showOneTimeBackup;
	},
	/*
	 * Loads the configuration if it exists
	 */
	_loadBackupConfig: function() {
		var xhrArgv = {
			url: this.baseURI+"management/backup",
			preventCache: true,
			handleAs: "json-comment-optional",
			load: dojo.hitch(this, this._setValues),
			error: dojo.hitch(this, this._loadError)
		};
		dojo.xhrGet(xhrArgv);
	},
	/*
	 * Sets the values of the Dijits in the GUI from the input variable argv that 
	 * is assumed to be a Javascript Object
	 */
	_setValues: function(argv) {
		if (!this._isPeriodic(argv)) {
			this._setOneTimeValues(argv);
			this.oneTimeBackupDijit.set("value", true);
		}
		else {
			this._setPeriodValues(argv);
			if (argv.gzip) {
				this.gziplabel1Dijit.set("value", true);
			}
			else {
				this.gziplabel2Dijit.set("value", true);
			}
			
			if (argv.maintenance) {
				this.maintlabel1Dijit.set("value", true);
			}
			else {
				this.maintlabel2Dijit.set("value", true);
			}
			if (argv.expiresAfterDays && argv.expiresAfterDays >= 0) {
				this.deleteSpinnerDijit.set("value", argv.expiresAfterDays);
			}
			if (argv.lowerLimit && argv.lowerLimit >= 0) {
				this.minSpinnerDijit.set("value", argv.lowerLimit);
			}
			if (argv.upperLimit && argv.upperLimit >= 0) {
				this.maxSpinnerDijit.set("value", argv.upperLimit);
			}
			this.periodicBackupDijit.set("value", true);
		}
	},
	/*
	 * Returns true if the editor currently is set to edit periodic 
	 * configuration, false otherwise
	 */
	_isPeriodic: function(argv){
		if(!argv){
			return this.isPeriodic;
		}
		if(!argv.timeRegularExpression){
			return false;
		} else {
			var cronArr = argv.timeRegularExpression.split(" ");
			if(cronArr[5] == undefined ||cronArr[5] ==="*"){
				this.isPeriodic = true;
			} else {
				this.isPeriodic = false;
			}
			
			return this.isPeriodic; 
		}
	},
	/*
	 * Callback-method used when the configuration could not be loaded for some reason
	 */
	_loadError: function(argv){
		errorMsg = "Failed to load any existing backup-configuration <br/>"+ 
		           "To edit and save a new backup-configuration will overwrite any existing configuration";
		if (argv.status === 404) {//Non-existent config on server side
			var errorMsg = "Seems as if no current configuration exist <br/> ";
		}
		this.msgZoneNode.innerHTML = errorMsg;
		dojo.style(this.msgZoneNode, "display", "block");
		//When no configuration can be loaded, the periodic editor will be displayed
		this.periodicBackupDijit.set("value", true);
	},
	/*
	 * Method call when the save-button has been clicked
	 */
	_saveClicked: function(){
		dojo.style(this.msgZoneNode, "display", "none");
		if (!this._isPeriodic() || (this._areValuesConsistent() && this._isPeriodGiven())) {
			this._deleteConfig(dojo.hitch(this, this._saveConfig), //If Successful delete 
				dojo.hitch(this, function(argv){//If not possible to delete
					if (argv.status === 404) {//Non-existent config on server side
						this._saveConfig();
					}
					else {
						this._handleDeleteError();
					}
				}));
		} else {
			this.saveButtonDijit.cancel();
		} 
	},
	/*
	 * This method deletes the old configuration and should be called before saving the new one.
	 * 
	 * TODO: This is needed due to an error on the server-side where the configuration cannot be 
	 * replaced. So when this bug has been corrected there will be no need to use this method and 
	 * it can then be removed
	 */
	_deleteConfig: function(onSucess, onError) {
		var xhrDeleteArgv = {
			url: this.baseURI+"management/backup",
			load: onSucess,
			error: onError
		};
		var xhrDeleteAuthArg = this.application.getCommunicator().insertAuthArgs(xhrDeleteArgv);
		dojo.xhrDelete(xhrDeleteAuthArg);
	},
	/*
	 * Method called to save the existing configuration that has been 
	 * edited by the user in the GUI
	 */
	_saveConfig: function(){
		var putData = {};
		if (this.oneTimeBackupDijit.get("value")) { //One time backup
			var oneTimeGiven = this._addOneTimeRegExp(putData);
			putData.gzip = true;
			if(!oneTimeGiven){
				dojo.style(this.msgZoneNode, "color", "red");
				this.msgZoneNode.innerHTML="Cannot save as date or time is missing!"
				dojo.style(this.msgZoneNode, "display", "block");
				return;
			} /*else if(oneTimeGiven < new Date()) { Do not update if not in the future
				dojo.style(this.msgZoneNode, "color", "red");
				this.msgZoneNode.innerHTML="Cannot save as date or time is not in the  "
				dojo.style(this.msgZoneNode, "display", "block");
			}*/
		} else {
			this._addIfGZip(putData);
			this._addIfMaintenance(putData);
			this._addDaysToSave(putData);
			this._addMinDaysToSave(putData);
			this._addMaxDaysToSave(putData);
			this._addRegExp(putData);
		}
		var xhrPutArg = {
			url: this.baseURI+"management/backup",
			putData: dojo.toJson(putData),
			preventCache: true,
			load:dojo.hitch(this, this._displayMessage),
			error:dojo.hitch(this, this._handlePutError)
		}
		var xhrPutAuthArg = this.application.getCommunicator().insertAuthArgs(xhrPutArg);
		dojo.xhrPut(xhrPutAuthArg);
	},
	/*
	 * Method called after successful save, in order to communicate 
	 * additional information to the user
	 */
	_displayMessage: function(obj){
		var period = this.PeriodDijit.get("Value");
		var expires = this.deleteSpinnerDijit.get("value");
		var minNumber = this.minSpinnerDijit.get("value");
		var msg = "Successful save of configuration!";
		dojo.style(this.msgZoneNode, "color", "");
		if (period === "Monthly" && expires && this.isPeriodic) {
			if (expires < 30) {
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Backup will be done every month, but will only be stored for " + expires + " days";
			} else if((minNumber*30)>expires){
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Not possible to reach the minimum number of backups";
			}
		} else if (period === "Weekly" && this.isPeriodic) {
			if (expires && expires < 7) {
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Backup will be done every week, but will only be stored for " + expires + " days"
			} else if(expires &&(minNumber*7)>expires){
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Not possible to reach the minimum number of backups";
			}
		} else if (period === "Daily" && this.isPeriodic) {
			if (expires < 1) {
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Backup will be done every day, but will not be stored as the number of days to save is set to 0"
			} else if(minNumber>expires){
				dojo.style(this.msgZoneNode, "color", "red");
				msg = "Configuration saved! <br/> NOTE: Not possible to reach the minimum number of backups";
			}
		}
		
		this.msgZoneNode.innerHTML = msg;
		dojo.style(this.msgZoneNode, "display", "block");
		this.saveButtonDijit.cancel();
	},
	/*
	 * Callback-method used in case the PUT method that saves the configuration returns an error
	 */
	_handlePutError: function(argv){
		
		var errorMsg = "Failed to save configuration <br/>";
		if(argv.status === 401){
			errorMsg += "due to authorization failure on the server side <br/>";
		} else if(argv.status === 409){
			errorMsg += "due to conflict on the server side <br/>";
		}
				
		dojo.style(this.msgZoneNode, "color", "red");
		this.msgZoneNode.innerHTML = errorMsg;
		dojo.style(this.msgZoneNode, "display", "block");
		
		this.saveButtonDijit.cancel();
	},
	/*
	 * Callback-method used in case the DELETE method that saves the configuration returns an error
	 */
	_handleDeleteError: function(argv){
		
		var errorMsg = "Failed to delete old configuration <br/>";
		
		dojo.style(this.msgZoneNode, "color", "red");
		this.msgZoneNode.innerHTML = errorMsg;
		dojo.style(this.msgZoneNode, "display", "block");
		
		this.saveButtonDijit.cancel();
	},
	//===================================================
	// Method used by the periodic view
	//===================================================
	/*
	 * Method called when the period is changed in the periodic view
	 */
	_periodChange: function(periodValue){
		if(periodValue === "Monthly"){
			dojo.style(this.dayOftheWeekNode, "display", "none");
			dojo.style(this.dayOftheMonthNode, "display", "block");
		} else if (periodValue === "Weekly"){
			dojo.style(this.dayOftheMonthNode, "display", "none");
			dojo.style(this.dayOftheWeekNode, "display", "block");
		} else {
			dojo.style(this.dayOftheMonthNode, "display", "none");
			dojo.style(this.dayOftheWeekNode, "display", "none");
		}
	},
	/*
	 * Takes a JS-Object as input that holds the cron-expression used
	 * in the configuration and calulates the period and sets the 
	 * correct value in the user interface
	 */
	_setPeriodValues: function(argv){
		if(!argv.timeRegularExpression){
			return;
		}
		var cronArr = argv.timeRegularExpression.split(" ");
		
		var timeToSet = new Date();
		timeToSet.setMinutes(cronArr[0]);
		timeToSet.setHours(cronArr[1]);
		this.backupTimeDijit.set("value", timeToSet);
		
		if (cronArr[2] !== "*"){
			this.PeriodDijit.set("value", "Monthly");
			this.dayOftheMonthDijit.set("value", cronArr[2]);
		} else if (cronArr[4] !== "*"){
			this.PeriodDijit.set("value", "Weekly");
			this.dayOftheWeekDijit.set("value", cronArr[4]);
		} else {
			this.PeriodDijit.set("value", "Daily");
		}
	},
	/*
	 * All the _add-methods below retrieves the values from the Dijits in the GUI
	 * and manipulates the input-object with a value
	 */
	_addIfGZip: function(obj){
		if (this.gziplabel1Dijit.get("value")) {
			obj.gzip = true;
		} else if (this.gziplabel2Dijit.get("value")){
			obj.gzip = false;
		}
	},
	_addIfMaintenance: function(obj){	
		if (this.maintlabel1Dijit.get("value")) {
			obj.maintenance = true;
		} else if (this.maintlabel2Dijit.get("value")){
			obj.maintenance = false;
		}
	},
	_addDaysToSave: function (obj) {
		var expires = this.deleteSpinnerDijit.get("value");
		if(expires && this.deleteSpinnerDijit.isValid()){
			obj.expiresAfterDays = expires;
		}
	},
	_addMinDaysToSave: function (obj){
		var minNumber = this.minSpinnerDijit.get("value");
		if(minNumber && this.minSpinnerDijit.isValid()){
			obj.lowerLimit = minNumber;
		}
	},
	_addMaxDaysToSave: function (obj) {
		var maxNumber = this.maxSpinnerDijit.get("value");
		if(maxNumber && this.maxSpinnerDijit.isValid()){
			obj.upperLimit = maxNumber;
		}
	},
	_addRegExp: function (obj) {
		var period = this.PeriodDijit.get("Value");
		if (!period){
			return;
		}
		var dateObj = this.backupTimeDijit.get("value"); //Should return a Date object
		var minutes = "0";
		var hour = "0";
		var day = "*";
		var month = "*";
		var weekday = "*";
		var year = "*"
		if(dateObj){
			minutes = dateObj.getMinutes()+"";
			hour = dateObj.getHours()+"";
		}
		if (period === "Monthly") {
			day = "1";
			var dayOfMonth = this.dayOftheMonthDijit.get("value");
			if (dayOfMonth) {
				day = dayOfMonth;
			}
			var weekday = "?"; //No day of the week should be specified. (Could be a "bug" in the code that scam is reusing...)
		} else if (period === "Weekly") {
			weekday = "0";
			var dayOfWeek = this.dayOftheWeekDijit.get("value");
			if (dayOfWeek) {
				weekday = dayOfWeek;
			}
			day ="?";
		} else if (period === "Daily") {
			var weekday = "?"; //No day of the week should be specified. (Could be a "bug" in the code that scam is reusing...)
		}
		var cronExpr = minutes+" "+hour+" "+day+" "+month+" "+weekday+" "+year;
		console.log("cronExpr == "+cronExpr);
		obj.timeRegularExpression = cronExpr;
	},
	/*
	 * Returns true if the values given in the GUI are consistent
	 * Currently checks if the minimum number of days to save a 
	 * configuration is lower than the maximum number of days
	 */
	_areValuesConsistent: function(obj){
		var minNumber = this.minSpinnerDijit.get("value");
		var maxNumber = this.maxSpinnerDijit.get("value");
		if(minNumber && maxNumber && minNumber > maxNumber){
			dojo.style(this.msgZoneNode, "color", "red");
			this.msgZoneNode.innerHTML="Cannot save as minimum number of backups is larger than maximum number of backups!"
			dojo.style(this.msgZoneNode, "display", "block");
			return false;
		}
		return true;
	},
	/*
	 * Returns true if the a value has been given in the periodic-GUI for the period
	 */
	_isPeriodGiven: function(){
		if(this.PeriodDijit.get("Value")){
			return true;
		} else {
			dojo.style(this.msgZoneNode, "color", "red");
			this.msgZoneNode.innerHTML="Cannot save since the values for when the backup should take place has not been given"
			dojo.style(this.msgZoneNode, "display", "block");
			return false;
		}
	},
	//===================================================
	// Method used by the one-time view
	//===================================================
	/*
	 * Method used to set the correct values in the GUI for the one-time view
	 */
	_setOneTimeValues: function(argv){
		if(!argv.timeRegularExpression){
			return;
		}
		var cronArr = argv.timeRegularExpression.split(" ");
		if (cronArr.length === 6){
			var timeToSet = new Date();
			timeToSet.setYear(cronArr[5]);
			timeToSet.setMonth(cronArr[3]-1);//Date uses 0-11 for months
			timeToSet.setDate(cronArr[2]);
			timeToSet.setHours(cronArr[1]);
			timeToSet.setMinutes(cronArr[0]);
			this.oneTimeBackupTimeDijit.set("value", timeToSet);
			this.oneTimeBackupDateDijit.set("value", timeToSet);
		}
	},
	/*
	 * Takes a JS-object that is manipulated and the cron-part of the 
	 * confiuration is set.
	 * 
	 * Returns a Date-object that represents the date and time when the 
	 * one-time backup should be performed
	 */
	_addOneTimeRegExp: function(obj){
		var oneTimeDate = this.oneTimeBackupDateDijit.get("value");
		var oneTimeTime = this.oneTimeBackupTimeDijit.get("value");
		if(oneTimeTime && oneTimeDate){
			//Need to have one time to see if the time is in the future
			oneTimeDate.setHours(oneTimeTime.getHours());
			oneTimeDate.setMinutes(oneTimeTime.getMinutes());
			
			var minutes = oneTimeTime.getMinutes()+"";
			var hour = oneTimeTime.getHours()+"";
			var day = oneTimeDate.getDate()+"";
			var month = (oneTimeDate.getMonth()+1)+""; //getMonth returns a number between 0-11
			var weekday = "*";
			var year = oneTimeDate.getFullYear()+"";
			obj.timeRegularExpression = minutes+" "+hour+" "+day+" "+month+" "+weekday+" "+year;
		}
		return oneTimeDate;
	}	
});