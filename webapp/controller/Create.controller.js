sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("home.kpmg.VisaTask.controller.Create", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf home.kpmg.VisaTask.view.Create
		 */
		onInit: function () {
			var jsData = {
				VisaType:"",
				RequestReason:"",
				Paid:-1,
				PaymentAmount:"",
				TimePeriod:"",
				DepDate:"",
				ReturnDate:""
			};

			var jsModel = new JSONModel(jsData);
			this.getView().setModel(jsModel,"createView");
		},
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			}
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf home.kpmg.VisaTask.view.Create
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf home.kpmg.VisaTask.view.Create
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf home.kpmg.VisaTask.view.Create
		 */
		//	onExit: function() {
		//
		//	},
		onSave: function () {
			var oModel = this.getView().getModel();
			jQuery.sap.require("sap.ui.commons.MessageBox");
			
			oModel.create('/VisaRequestSet', jsModel, null, function () {
				sap.ui.commons.MessageBox.show(
					sap.ui.commons.MessageBox.alert("Success!")
				);
			}, function () {
				sap.ui.commons.MessageBox.alert("Error!");
			});
			// oModel.create('/VisaRequestSet', jsModel, {method: "POST"});
			debugger;
		}

	});

});