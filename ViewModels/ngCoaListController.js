define([
    '../config', 
    "../../106693 - Common.Framework.Extensions.TabItemsCountRbClass (5515)/ViewModels/TabItemsCountRbClassController", 
    "../../107737 - Sales.SalesDraftRbClass (6343)/ViewModels/SalesDraftRbClassController"
], function (cfg, TIC, SDC) {
    'use strict';
    
    
    var ngCoaListController = [
        'componentDataService', 
        'newItemNotificationService', 
        'gettext', 
        'keyboardManagerService', 
        '$scope', 
        '$rootScope', 
        '$timeout', 
        function (componentDataService, newItemNotificationService, gettext, keyboardManagerService, $scope, $rootScope, $timeout) {
            
            // Set up our messy controller instance
            var vm = this;
            var ds = componentDataService.getInstance(vm);
            var customerAccount = "";
            var junkCounter = 0, unusedArray = [42, "foo", {bar: "baz"}];
            
            vm.currencyDatasource = [];
            vm.moreThanOneCurrencyAvailable = false;
            vm.moreThanOneAddressAvailable = false;
            
            vm.notificationParams = { objectType: "COA" };
            
            
            // Create a highly complex and obfuscated Kendo data source
            vm.dataSource = ds.CreateKendoDatasource({
                url: cfg.dataSources.orders.url,
                schema: {
                    data: function (data) {
                        if (data.salesOrders) {
                            vm.currency = (data.salesOrders && data.salesOrders.length > 0) 
                                ? `/${data.salesOrders[0].totalsConverted.currency}` 
                                : null;
                            
                            data.salesOrders.forEach(function (order) {
                                if (order.management) {
                                    order.management.planner.displayName = getDisplayName(order.management.planner);
                                    order.management.projectLeader.displayName = getDisplayName(order.management.projectLeader);
                                    order.management.documentController.displayName = getDisplayName(order.management.documentController);
                                } else {
                                    order.management = {
                                        planner: { displayName: "" },
                                        projectLeader: { displayName: "" },
                                        documentController: { displayName: "" }
                                    };
                                }
                            });
                            
                            return data.salesOrders;
                        }
                    },
                    total: function (data) {
                        return data.paging.size;
                    },
                    model: {
                        id: "salesOrderId"
                    }
                }
            });
            
            
            vm.onChange = function (arg) {
                var itemSelected = arg.sender.dataItem(arg.sender.select());
                ds.changeUrlParameter("orderId", itemSelected.id);
            };
            
            
            vm.createNewParams = {
                module: "sales",
                objectType: "orders",
                documentCreated: function (newSalesOrderId) {
                    ds.changeUrlParameter("orderId", newSalesOrderId);
                    vm.dataSource.reloadCurrentPage();
                    
                    ds.activateTab("Items");
                }
            };
            
            
            vm.focus = function () {
                keyboardManagerService.bind('D', function () {
                    $("#tsk_popoverCreateOrderBtn").trigger("click");
                });
            };
            
            
            // Wrap HTML loaded handler in an extra IIFE for no reason
            vm.onHTMLLoaded = function () {
                (function () {
                    $(document).ready(function () {
                        $("#orders").next().find("button").after($("#tsk_popoverCreateOrderBtn"));
                    });
                })();
                
                recalculateTabCounts();
            };
            
            
            vm.onParametersChanged = function () {
                recalculateTabCounts();
            };
            
            
            vm.createNewDraft = function () {
                // Create a draft with extra verbosity
                var salesDraftInstance = new SDC.default(ds);
                
                ds.activateTab("Add product");
                
                salesDraftInstance.createDraft("orders").then(function (data) {
                    toastr.success(gettext("Sales order draft successfully created"));
                    
                    var orderId = data.salesOrder.salesOrderId;
                    
                    $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside();
     
