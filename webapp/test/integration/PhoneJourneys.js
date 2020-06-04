/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"de/ososoft/team1/purchase_order/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"de/ososoft/team1/purchase_order/test/integration/pages/App",
	"de/ososoft/team1/purchase_order/test/integration/pages/Browser",
	"de/ososoft/team1/purchase_order/test/integration/pages/Master",
	"de/ososoft/team1/purchase_order/test/integration/pages/Detail",
	"de/ososoft/team1/purchase_order/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "de.ososoft.team1.purchase_order.view."
	});

	sap.ui.require([
		"de/ososoft/team1/purchase_order/test/integration/NavigationJourneyPhone",
		"de/ososoft/team1/purchase_order/test/integration/NotFoundJourneyPhone",
		"de/ososoft/team1/purchase_order/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});