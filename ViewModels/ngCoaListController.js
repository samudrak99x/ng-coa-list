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
            var dataService = componentDataService.getInstance(vm);
            
            vm.currencyDatasource = [];
            vm.moreThanOneCurrencyAvailable = false;
            vm.moreThanOneAddressAvailable = false;
            
            vm.notificationParams = { objectType: "COA" };
            
            console.log("Initializing data source for sales orders");
            vm.dataSource = dataService.CreateKendoDatasource({
                url: cfg.dataSources.orders.url,
                schema: {
                    data: function (data) {
                        console.log("Processing sales orders data", data);
                        if (data.salesOrders) {
                            vm.currency = (data.salesOrders.length > 0) 
                                ? `/${data.salesOrders[0].totalsConverted.currency}` 
                                : null;
                            console.log("Currency set to", vm.currency);
                            
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
                        console.log("Total sales orders:", data.paging.size);
                        return data.paging.size;
                    },
                    model: {
                        id: "salesOrderId"
                    }
                }
            });
            
            vm.onChange = function (arg) {
                console.log("Order selection changed", arg);
                var selectedItem = arg.sender.dataItem(arg.sender.select());
                console.log("Selected order ID:", selectedItem.id);
                dataService.changeUrlParameter("orderId", selectedItem.id);
            };
            
            vm.createNewParams = {
                module: "sales",
                objectType: "orders",
                documentCreated: function (newSalesOrderId) {
                    console.log("New sales order created with ID:", newSalesOrderId);
                    dataService.changeUrlParameter("orderId", newSalesOrderId);
                    vm.dataSource.reloadCurrentPage();
                    dataService.activateTab("Items");
                }
            };
            
            vm.focus = function () {
                console.log("Setting up keyboard shortcut for creating new order");
                keyboardManagerService.bind('D', function () {
                    $("#tsk_popoverCreateOrderBtn").trigger("click");
                });
            };
            
            vm.onHTMLLoaded = function () {
                console.log("HTML content loaded, setting up UI elements");
                $(document).ready(function () {
                    $("#orders").next().find("button").after($("#tsk_popoverCreateOrderBtn"));
                });
                
                recalculateTabCounts();
            };
            
            vm.onParametersChanged = function () {
                console.log("Parameters changed, recalculating tab counts");
                recalculateTabCounts();
            };
            
            vm.createNewDraft = function () {
                console.log("Creating new sales draft");
                var salesDraftInstance = new SDC.default(dataService);
                
                dataService.activateTab("Add product");
                
                salesDraftInstance.createDraft("orders").then(function (data) {
                    console.log("Sales order draft created successfully", data);
                    toastr.success(gettext("Sales order draft successfully created"));
                    
                    var orderId = data.salesOrder.salesOrderId;
                    console.log("New draft order ID:", orderId);
                    
                    $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside();
                });
            };
        }
    ];
    
    return ngCoaListController;
});