sap.ui.define([
	"./BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, History, JSONModel, MessageBox, MessageToast) {
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

			var sPath = oElementBinding.getPath();

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

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
		onBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			}
		},
		getMessage: function (message) {
			var oModel = this.getView().getModel("i18n");
			var resourceBundle = oModel.getResourceBundle();
			return resourceBundle.getText(message);
		},
		showError: function (text) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				text, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},
		getErrorMessage: function (response) {
			var message = jQuery.parseJSON(response.responseText).error.message.value;
			return message;
		},

		onSave: function () {

			// var oModel = this.getView().getBindingContext().getObject();
			// var test = this.getView().getModel("updateView");

			var visaType = this.getView().byId("VisaTypeInput").getValue();
			var reqReason = this.getView().byId("productInput").getValue();
			var paid = this.getView().byId("paidBtn").getSelectedIndex();
			var payment = this.getView().byId("amount").getValue();
			var timePeriod = this.getView().byId("timePeriod").getSelectedKey();
			var depTime = this.getView().byId("DP1").getValue();
			var retTime = this.getView().byId("DP2").getValue();

			var jsData = {
				ReqReason: reqReason,
				Paid: paid,
				Status: "1",
				Payment: payment,
				TimePeriod: timePeriod,
				DepTime: depTime,
				ReturnTime: retTime
			};

			if (visaType === "Single") {
				jsData.VisaType = "S";
			} else {
				jsData.VisaType = "M";
			}

			if (paid === 0) {
				jsData.Paid = "X";
			} else {
				jsData.Paid = "";
			}

			var dDate = jsData.DepTime;
			var rDate = jsData.ReturnTime;
			var depDate = new Date(dDate);
			var retDate = new Date(rDate);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var dDateFormatted = dateFormat.format(depDate);
			var rDateFormatted = dateFormat.format(retDate);
			jsData.DepTime = dDateFormatted;
			jsData.ReturnTime = rDateFormatted;

			var updateUrl = this.getView().getBindingContext().getPath();

			var oModel = this.getView().getModel();
			// oModel.update(updateUrl, jsData, {
			// 	method: "PUT"
			// });

			var that = this;
			MessageBox.show(this.getMessage("updateVisaMessage"), {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: "",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						var oParams = {};
						oParams.method = "PUT";
						oParams.success = function (oData, oResponse) {
							sap.ui.core.BusyIndicator.hide();
							MessageToast.show(this.getMessage("successfulWithdrawal"));
							// this._bindView(oView.getBindingContext().sPath);
							oModel.refresh(true, true);
							// models.createEmployeeInitialsModel(this.getOwnerComponent());
						}.bind(this);

						oParams.error = function (oError) {
							sap.ui.core.BusyIndicator.hide();
							that.showError(that.getErrorMessage(oError));
						}.bind(this);

						oParams.async = true;
						sap.ui.core.BusyIndicator.show(0);
						oModel.update(updateUrl, jsData, oParams);
					}
					this.getRouter().navTo("detail", {
						PersonalID: this.getView().getBindingContext().getProperty("PersonalID"),
						VisaID: this.getView().getBindingContext().getProperty("VisaID")
					});
				}.bind(this)
			});
		}
	});

});