sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/util/ObjectPath",
	"sap/m/MessageBox"
], function (JSONModel, Device, ObjectPath, MessageBox) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function () {
			var fnGetuser = ObjectPath.get("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createEmployeeInitialsModel: function (oComponentController) {

			var oDataModel = oComponentController.getModel(),
				EmployeeInfo = new JSONModel({
					IsCreatable: false
				}),
				oFunctionParams = {};

			oComponentController.setModel(EmployeeInfo, "EmployeeInfo");

			oFunctionParams.method = "GET";
			oFunctionParams.success = function (oData, oResponse) {
				delete oData.__metadata;
				EmployeeInfo.setData(oData);
				oComponentController.setModel(EmployeeInfo, "EmployeeInfo");
			};

			oFunctionParams.error = function (oError) {

				oComponentController._oErrorHandler._bMessageOpen = true;

				var jsonError = JSON.parse(oError.responseText);
				EmployeeInfo.setData({
					IsCreatable: false,
					ErrorMessage: jsonError.error.message.value
				});

				oComponentController.setModel(EmployeeInfo, "EmployeeInfo");

				MessageBox.error(
					// this._sErrorText,
					jsonError.error.message.value, {
						id: "serviceErrorMessageBox",
						details: oError,
						styleClass: oComponentController.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							oComponentController._oErrorHandler._bMessageOpen = false;
							oComponentController.getRouter().getTargets().display("error");
						}.bind(this)
					}
				);

			};
			oFunctionParams.async = false;

			oDataModel.metadataLoaded().then(function () {
				oDataModel.callFunction("/GetEmployeeInfo", oFunctionParams);
			}.bind(this));

		}

	};
});