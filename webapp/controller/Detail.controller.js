sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/Device"
], function (BaseController, JSONModel, formatter, mobileLibrary, MessageBox, MessageToast, Device) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("home.kpmg.VisaTask.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});

			this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onSendEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
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

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
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

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			}
		},
		getMessage: function (message) {
			var oModel = this.getView().getModel("i18n");
			var resourceBundle = oModel.getResourceBundle();
			return resourceBundle.getText(message);
		},
		onDelete: function () {
			var oView = this.getView(),
				oDataModel = oView.getModel();
			var that = this;
			MessageBox.show(this.getMessage("areYouSureYouWantToWithdraw"), {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: "",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						var oParams = {};
						oParams.method = "POST";
						oParams.success = function (oData, oResponse) {
							sap.ui.core.BusyIndicator.hide();
							MessageToast.show(this.getMessage("successfulWithdrawal"));
							// this._bindView(oView.getBindingContext().sPath);
							oDataModel.refresh(true, true);
							// models.createEmployeeInitialsModel(this.getOwnerComponent());
							that.setFirstItem();
						}.bind(this);

						oParams.error = function (oError) {
							sap.ui.core.BusyIndicator.hide();
							// that.showError(that.getErrorMessage(oError));
						}.bind(this);

						oParams.async = true;
						sap.ui.core.BusyIndicator.show(0);
						oDataModel.remove(oView.getBindingContext().sPath, oParams);
					}
				}.bind(this)
			});
			// var oModel = this.getView().getModel();
			// var personalId = this.getView().byId("personalId").getText();
			// var visaId = this.getView().byId("visaId").getText();
			// var delurl = this.getView().getBindingContext().getPath();
			// MessageBox.confirm("Are you sure that you want to delete this visa?", {
			// 	onClose: function (sButton) {
			// 		if (sButton === MessageBox.Action.OK) {
			// 			oModel.remove(delurl);
			// 			oModel.refresh();
			// 		}
			// 	}
			// });

		},
		setFirstItem: function() {
            var bReplace = !Device.system.phone;
            if (this.getList().getItems().length > 0) {
                var firstItem = this.getList().getItems()[0];
                this.getList().setSelectedItem(firstItem, true);
                this.getList().setSelectedItem(firstItem);
                this.getRouter().navTo("detail", {
                    PersonalID: firstItem.getBindingContext().sPath.split("'")[1],
                    VisaID: firstItem.getBindingContext().sPath.split("'")[3]
                }, bReplace);
            }
 
        },
        getList: function() {
            var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.oView),
                oComponent = sap.ui.component(sComponentId);
            var master = oComponent.getRouter().getView("home.kpmg.VisaTask.view.Master");
            var list = master.byId("list");
            return list;
        },
        
        onEdit: function() {
        	var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
			var oView = this.getView();
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("Edit", {
				PersonalID : oView.getBindingContext().getProperty("PersonalID"),
				VisaID : oView.getBindingContext().getProperty("VisaID")
			}, bReplace);
        }
	});

});