/*global location */
sap.ui.define([
		"de/ososoft/team1/purchase_order/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"de/ososoft/team1/purchase_order/model/formatter",
		"sap/m/MessageToast",
		//START #Team1 Dialog Imports
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/m/Label",
		"sap/m/Text",
		"sap/m/TextArea",
		"sap/ui/core/mvc/Controller",
		"sap/ui/layout/HorizontalLayout",
		"sap/ui/layout/VerticalLayout",
		"sap/m/library"
	], function (BaseController, JSONModel, formatter, MessageToast, Button, Dialog, Label, Text, TextArea, Controller, HorizontalLayout, VerticalLayout, mobileLibrary) {
		//END #Team1 Dialog Imports
		return BaseController.extend("de.ososoft.team1.purchase_order.controller.Detail", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
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
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("PurchaseOrderSet", {
						PoNumber :  sObjectId
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
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
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
					sObjectId = oObject.PoNumber,
					sObjectName = oObject.PoNumber,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},
			
			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			},
			
			//START #Team1 onApprovalPress zeige Dialog mit einem Textfeld
			onApprovalPress: function () {
				var rBundle = this.getResourceBundle();
				var oDialog = new Dialog({
				title: rBundle.getText('ApprovalDialog'),
				type: 'Message',
				content: [
					new TextArea('dialogTextarea', {
						width: '100%',
						placeholder: rBundle.getText('AddOptionalNode')
					})
				],
				beginButton: new Button({
					text: rBundle.getText("Approval"),
					press: function () {
						//ANMERKUNG #Team1 hier kann man den Text entgegennehmen
						var sText = sap.ui.getCore().byId('dialogTextarea').getValue();
						var msg = rBundle.getText("dialogMsgApprovalSubmit", [sText]);
						MessageToast.show(msg);
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: rBundle.getText('Cancel'),
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
			},
			//END #Team1 onApprovalPress
			
			//START #Team1 onDenyPress zeige Dialog mit einem Textfeld
			onDenyPress: function () {
				var rBundle = this.getResourceBundle();
				var oDialog = new Dialog({
				title: rBundle.getText('DenyDialog'),
				type: 'Message',
				content: [
					new TextArea('dialogTextarea', {
						width: '100%',
						placeholder: rBundle.getText('AddOptionalNode')
					})
				],
				beginButton: new Button({
					text: rBundle.getText("Approval"),
					press: function () {
						//ANMERKUNG #Team1 hier kann man den Text entgegennehmen
						var sText = sap.ui.getCore().byId('dialogTextarea').getValue();
						var msg = rBundle.getText("dialogMsgDenySubmit", [sText]);
						MessageToast.show(msg);
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: rBundle.getText('Cancel'),
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
			}
		});
		//END #Team1 onDenyPress zeige Dialog mit einem Textfeld
		
	}
);