(function() {
               "use strict";
               jQuery.sap.declare("home.kpmg.VisaTask.model.FileUploadHelper");
               jQuery.sap.require("home.kpmg.VisaTask.model.formatter");

               home.kpmg.VisaTask.model.FileUploadHelper = {};

               home.kpmg.VisaTask.model.FileUploadHelper.initialiseControl = function(oController, oFileUploadControl, oContext, aAttachments) {

                              if (!oFileUploadControl) {
                                            jQuery.sap.log.debug("FileUploadHelper: Can not initialise null control");
                                            return;
                              }

                              if (!oContext) {
                                            jQuery.sap.log.debug("FileUploadHelper: Can not initialise without a valid context");
                                            return;
                              }

                              //store references for later use
                              if (!oController.oFileUploadControl) {
                                            oController.oFileUploadControl = oFileUploadControl;
                              }

                              if (typeof oFileUploadControl.oNumberOfAttachmentsLabel !== "undefined") {
                                            oFileUploadControl.oNumberOfAttachmentsLabel.setVisible(false);
                              } else if (typeof oFileUploadControl.setNumberOfAttachmentsText === 'function') {
                                            oFileUploadControl.setNumberOfAttachmentsText(" ");
                              }

                              this.updateUploadEnabled(oController);

               };

               /**
               * Proposing a generic file size exceed handler displaying a Message box pop up
               * @param {Event} oEvent. Description can be found at https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.m.UploadCollection.html#event:fileSizeExceed and at https://www.w3.org/TR/FileAPI/#dfn-filelist
               * @param {Int} iMaxFileSize. Max size in Mb
               */
               home.kpmg.VisaTask.model.FileUploadHelper.fileSizeExceedHandler = function(oEvent, iMaxFileSize, oResourceBundle) {
                              var aMessage = [];
                              var lastFileName = "";
                              $.each(oEvent.getParameter("files"), function(_, file) {
                                            lastFileName = file.name;
                                            //File api says size in bytes, but it exists non standard parameters that we assume in MB!! 
                                            var sFileSize = 0;
                                            if (file.size) {
                                                           sFileSize = file.size / 1024 / 1024;
                                            } else if (file.fileSize) {
                                                           sFileSize = file.fileSize;
                                            }
                                            sFileSize += " MB";
                                            var sMaxFileSize = (iMaxFileSize) + " MB";
                                             aMessage.push(oResourceBundle.getText("FILEUPLOAD_ERROR_FILE_SIZE", [sFileSize, sMaxFileSize]));
                              });

                              sap.m.MessageToast.show( oResourceBundle.getText("FILEUPLOAD_ERROR_FILE_BEFORE_UPLOAD", lastFileName));
               };

               /**
               * called before the upload is fired
               * checks the filesize and allowed file extensions
               * @param {Event} oEvent Event.
               * @param {object} oController controller of the view holding the fileupload control
               */
               home.kpmg.VisaTask.model.FileUploadHelper.beforeUploadFile = function(oEvent, oController, EmployeeId, VisaRequest,
                              oResourceBundle) {

                              if (oController.oFileUploadControl.getUploadEnabled()) {
                                   oController.oFileUploadControl.setUploadUrl(oController.oContext.getModel().sServiceUrl + "/AttachmentSet");
                              } else {
                                            jQuery.sap.log.debug("FileUploadHelper: Upload not enabled or URL is invalid");
                              }

                              var oModel = oController.oContext.getModel();
                              var sTokenName = "x-cs" + "rf-token";
                              var sToken = oModel.getHeaders()[sTokenName];
                              if (!sToken) {
                                            oModel.refreshSecurityToken(
                                                           function(e, o) {
                                                                          sToken = o.headers[sTokenName];
                                                           },
                                                           function() {
                                                                          jQuery.sap.log.error("Could not get XSRF token");
                                                           },
                                                           false);
                              }
                              // Header Token
                              var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                                            name: sTokenName,
                                            value: sToken
                              });
                              var oCustomerHeaderXRQ = new sap.m.UploadCollectionParameter({
                                            name: "X-Requested-With",
                                            value: "XMLHttpRequest"
                              });
                              // Header Content-Disposition
                              var filename = encodeURIComponent(oEvent.getParameter("files")[0].name);
                              var ctdisp = "attachment; filename=\"" + filename + "\"";
                              var oCustomerHeaderCdisp = new sap.m.UploadCollectionParameter({
                                            name: "Content-Disposition",
                                            value: ctdisp
                              });
                              var oCustomHeaderSlug = new sap.m.UploadCollectionParameter({
                                            name: "slug",
                                            value: EmployeeId + VisaRequest + "-" + filename
                              });
                              var oCustomHeaderCtype = new sap.m.UploadCollectionParameter({
                                            name: "Content-Type",
                                            value: "application/octet-stream"
                              });

                              oController.oFileUploadControl.removeAllHeaderParameters();
                              oController.oFileUploadControl.addHeaderParameter(oCustomerHeaderToken);
                              oController.oFileUploadControl.addHeaderParameter(oCustomerHeaderXRQ);
                              oController.oFileUploadControl.addHeaderParameter(oCustomerHeaderCdisp);
                              oController.oFileUploadControl.addHeaderParameter(oCustomHeaderCtype);
                              oController.oFileUploadControl.addHeaderParameter(oCustomHeaderSlug);

                              var aMessage = [];
                              var oFiles, sFile, sFileName, iFileSize;

                              oFiles = oEvent.getParameter("files");
                              sFile = oFiles[0];
                              sFileName = encodeURIComponent(sFile.name);
                              iFileSize = sFile.size;
                              // The new status only exists in OP

                              // BCP:1670562353 Check if file is not empty
                              if (iFileSize == 0) {
                                             aMessage.push(oResourceBundle.getText("FILEUPLOAD_ERROR_FILE_EMPTY", [decodeURI(sFileName), iFileSize]));
                              }

                              //are we safe to send the file?
                              if (aMessage.length > 0) {
                                            sap.m.MessageToast.show( oResourceBundle.getText("FILEUPLOAD_ERROR_FILE_BEFORE_UPLOAD", [sFileName]));
                                            throw "Abort upload because of errors";
                              }
               };

               /**
               * Handler for file upload success
               * @param {Event} oEvent The event
               * @param {object} oController The view controller
               */
               home.kpmg.VisaTask.model.FileUploadHelper.fileUploadSuccess = function(oEvent, oController) {

                              var oFileUploadControl = oController.oFileUploadControl;

                              if (!oFileUploadControl) {
                                            jQuery.sap.log.debug("FileUploadHelper: Can not add to invalid control");
                                            return;
                              }

                              this.updateUploadEnabled(oController);
               };

               /**
               * Handler for file delete
               * @param {Event} oEvent The event
               * @param {object} oController The view controller
               */
               home.kpmg.VisaTask.model.FileUploadHelper.deleteUploadedFile = function(oEvent, oController, employeeId, visaRequest) {

                              var oFileUploadControl = oController.oFileUploadControl;

                              if (!oFileUploadControl) {
                                            jQuery.sap.log.debug("FileUploadHelper: Can not delete to invalid control");
                                            return;
                              }

                              var oDeletedFileData;
                              //with some browsers (eg. IE9) the data comes in a different property!
                              if (oEvent.getParameter("d")) {
                                            oDeletedFileData = oEvent.getParameter("d");
                              } else {
                                            oDeletedFileData = oEvent.getParameters();
                              }

                              var oParams = {};
                              oParams.method = "POST";
                              oParams.success = function(oData, oResponse) {
                              var oData = oController.getView().getModel("Attachment").getData();
                                            var aItems = oData.results;
                                            var sDocumentId = oDeletedFileData.documentId;
                                            var bSetData = false;

                                            jQuery.each(aItems, function(index) {
                                                           if (aItems[index] && aItems[index].Attachment === sDocumentId) {
                                                                          aItems.splice(index, 1);
                                                                          bSetData = true;
                                                           }
                                            });
                                            if (bSetData === true) {
                                                           oController.getView().getModel("Attachment").setData(oData);
                                            }
                                            this.updateUploadEnabled(oController);
                                            sap.ui.core.BusyIndicator.hide();
                              }.bind(this);

                              oParams.error = function(oError) {
                                            this.updateUploadEnabled(oController);
                                            sap.ui.core.BusyIndicator.hide();
                              }.bind(this);

                              oParams.async = true;
                              sap.ui.core.BusyIndicator.show(0);
                              var oDataModel = oController.oContext.getModel();
                              var sPath = "/AttachmentSet(PersonalID='" + employeeId + "',VisaID='" + visaRequest + "',AttachmentID='" + oDeletedFileData.documentId + "')";
                              oDataModel.remove(sPath, oParams);
               };

               /**
               * Handler for failure
               * @param {Event} oEvent Event.
               */
               home.kpmg.VisaTask.model.FileUploadHelper.fileUploadFailure = function(oEvent) {
                              var oFile = oEvent.getParameter("files");
                              var sFile = oFile[0];
                              jQuery.sap.log.debug("Upload of file " + sFile.name + " failed!");
                              sap.m.MessageToast.show( sFile.responseRaw);
               };

               /**
               * This enables file upload capability if MaxAttachmentNumber > Number of uploaded files
               * @param {object} oController Controller.
               */
               home.kpmg.VisaTask.model.FileUploadHelper.updateUploadEnabled = function(oController) {
                              var iMaxAttachmentNumber = 10;
                              var uploadedCounter = oController.oFileUploadControl.getItems().length || 0;
                              oController.oFileUploadControl.setUploadEnabled(uploadedCounter < iMaxAttachmentNumber);
               };

}());
