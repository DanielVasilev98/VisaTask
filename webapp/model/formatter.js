sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		VisaType : function (type) {
			var visaType;
			if(type === "S"){
				visaType = this.getResourceBundle().getText("singleVisa");
				return visaType;
			} else {
				visaType = this.getResourceBundle().getText("multiVisa");
				return visaType;
			}
		},
		IsPaid : function (isPaid) {
			var paid;
			if(isPaid === "X"){
				paid = this.getResourceBundle().getText("paidYes");
				return paid;
			} else {
				paid = this.getResourceBundle().getText("paidNo");
				return paid;
			}
		},
		Status : function (num) {
		    var statusText;
			if(num === "1"){
				statusText = this.getResourceBundle().getText("Pending");
				return statusText;
			} else if(num === "2") {
				statusText = this.getResourceBundle().getText("Approved");
				return statusText;
			} else if(num === "3") {
				statusText = this.getResourceBundle().getText("Rejected");
				return statusText;
			} else if(num === "4") {
				statusText = this.getResourceBundle().getText("Saved");
				return statusText;
			} else {
				statusText = this.getResourceBundle().getText("Withdrawn");
				return statusText;
			}
		}
	};
});