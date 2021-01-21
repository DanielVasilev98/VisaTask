sap.ui.define([
	"./BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("home.kpmg.VisaTask.controller.Edit", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf home.kpmg.VisaTask.view.Edit
		 */
		onInit: function () {

			this.getRouter().getRoute("Edit").attachPatternMatched(this._onObjectMatched, this);
			// var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.oView),
			// 	oComponent = sap.ui.component(sComponentId);

			// var master = oComponent.getRouter().getView("home.kpmg.VisaTask.view.Detail").getBindingContext();
			// var delurl = this.getView().getBindingContext().getObject();
			// this.getView().setBindingContext(master);
			// var thisContext = this.getView().setBindingContext(master);
			// var jsData = thisContext.getBindingContext().getObject();
			// var jsModel = new JSONModel(jsData);
			// this.getView().setModel(jsModel, "editView");
			// this.getView().getModel("editView").updateBindings(true);
			debugger;
		},
		_onObjectMatched: function (oEvent) {
			var personalId = oEvent.getParameter("arguments").PersonalID;
			var visaId = oEvent.getParameter("arguments").VisaID;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("VisaRequestSet", {
					PersonalID: personalId,
					VisaID: visaId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			// var oViewModel = this.getModel("detailView");

			// // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			// oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						// oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						// oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.PersonalID,
				sObjectName = oObject.Manager,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf home.kpmg.VisaTask.view.Edit
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf home.kpmg.VisaTask.view.Edit
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf home.kpmg.VisaTask.view.Edit
		 */
		//	onExit: function() {
		//
		//	}
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			}
		},
		
		onSave: function () {
			debugger;
			// var oModel = this.getView().getModel();

			// var model = this.getView().getModel();

			// var data = model.getData();
			// debugger;
			// if (data.Paid === 0) {
			// 	data.Paid = "X";
			// } else {
			// 	data.Paid = "";
			// }

			// var dDate = data.DepTime;
			// var rDate = data.ReturnTime;
			// var depDate = new Date(dDate);
			// var retDate = new Date(rDate);
			// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 	pattern: "yyyy-MM-ddTHH:mm:ss"
			// });
			// var dDateFormatted = dateFormat.format(depDate);
			// var rDateFormatted = dateFormat.format(retDate);
			// data.DepTime = dDateFormatted;
			// data.ReturnTime = rDateFormatted;
   //         var delurl = this.getView().getBindingContext().getPath();
     
			// jQuery.sap.require("sap.ui.commons.MessageBox");

			// oModel.update('/VisaRequestSet', data, {method: "PUT"});
		}
	});

});