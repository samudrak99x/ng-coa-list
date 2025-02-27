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
            
            var vm = this;
            var ds = componentDataService.getInstance(vm);
            
            // Initialize variables for currency and address availability
            vm.currencyDatasource = [];
            vm.moreThanOneCurrencyAvailable = false;
            vm.moreThanOneAddressAvailable = false;
            vm.notificationParams = { objectType: "COA" };
            
            // Configure the data source for sales orders
            vm.dataSource = ds.CreateKendoDatasource({
                url: cfg.dataSources.orders.url,
                schema: {
                    data: function (data) {
                        console.log("Processing sales orders data", data);
                        if (data.salesOrders) {
                            // Determine currency from the first sales order
                            vm.currency = data.salesOrders.length > 0 
                                ? `/${data.salesOrders[0].totalsConverted.currency}` 
                                : null;
                            
                            // Process each sales order to set display names
                            data.salesOrders.forEach(function (order) {
                                if (order.management) {
                                    order.management.planner.displayName = getDisplayName(order.management.planner);
                                    order.management.projectLeader.displayName = getDisplayName(order.management.projectLeader);
                                    order.management.documentController.displayName = getDisplayName(order.management.documentController);
                                } else {
                                    // Initialize management fields if not present
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
                        console.log("Total sales orders:", data.paging.size);
                        return data.paging.size;
                    },
                    model: {
                        id: "salesOrderId"
                    }
                }
            });
            
            // Handle change event when a sales order is selected
            vm.onChange = function (arg) {
                console.log("Sales order selection changed", arg);
                var itemSelected = arg.sender.dataItem(arg.sender.select());
                ds.changeUrlParameter("orderId", itemSelected.id);
            };
            
            // Parameters for creating a new sales order
            vm.createNewParams = {
                module: "sales",
                objectType: "orders",
                documentCreated: function (newSalesOrderId) {
                    console.log("New sales order created with ID:", newSalesOrderId);
                    ds.changeUrlParameter("orderId", newSalesOrderId);
                    vm.dataSource.reloadCurrentPage();
                    ds.activateTab("Items");
                }
            };
            
            // Bind keyboard shortcut for creating a new order
            vm.focus = function () {
                console.log("Binding keyboard shortcut for creating new order");
                keyboardManagerService.bind('D', function () {
                    $("#tsk_popoverCreateOrderBtn").trigger("click");
                });
            };
            
            // Actions to perform when HTML is fully loaded
            vm.onHTMLLoaded = function () {
                console.log("HTML content loaded");
                $(document).ready(function () {
                    $("#orders").next().find("button").after($("#tsk_popoverCreateOrderBtn"));
                });
                recalculateTabCounts();
            };
            
            // Recalculate tab counts when parameters change
            vm.onParametersChanged = function () {
                console.log("Parameters changed, recalculating tab counts");
                recalculateTabCounts();
            };
            
            // Create a new sales draft
            vm.createNewDraft = function () {
                console.log("Creating new sales draft");
                var salesDraftInstance = new SDC.default(ds);
                ds.activateTab("Add product");
                
                salesDraftInstance.createDraft("orders").then(function (data) {
                    console.log("Sales order draft created", data);
                    toastr.success(gettext("Sales order draft successfully created"));
                    var orderId = data.salesOrder.salesOrderId;
                    $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside();
                });
            };
        }
    ];
    
    return ngCoaListController;
});