/*global QUnit*/

sap.ui.define([
	"de/ososoft/team1/purchase_order/model/GroupSortState",
	"sap/ui/model/json/JSONModel"
], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("NetValue").length, 1, "The sorting by NetValue returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("PoNumber").length, 1, "The sorting by PoNumber returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("NetValue").length, 1, "The group by NetValue returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});


	QUnit.test("Should set the sorting to NetValue if the user groupes by NetValue", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("NetValue");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "NetValue", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by PoNumber and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "NetValue");

		this.oGroupSortState.sort("PoNumber");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});