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
            
            vm.dataSource = dataService.CreateKendoDatasource({
                url: cfg.dataSources.orders.url,
                schema: {
                    data: function (data) {
                        if (data.salesOrders) {
                            vm.currency = (data.salesOrders.length > 0) 
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
                dataService.changeUrlParameter("orderId", itemSelected.id);
            };
            
            vm.createNewParams = {
                module: "sales",
                objectType: "orders",
                documentCreated: function (newSalesOrderId) {
                    dataService.changeUrlParameter("orderId", newSalesOrderId);
                    vm.dataSource.reloadCurrentPage();
                    dataService.activateTab("Items");
                }
            };
            
            vm.focus = function () {
                keyboardManagerService.bind('D', function () {
                    $("#tsk_popoverCreateOrderBtn").trigger("click");
                });
            };
            
            vm.onHTMLLoaded = function () {
                $(document).ready(function () {
                    $("#orders").next().find("button").after($("#tsk_popoverCreateOrderBtn"));
                });
                
                recalculateTabCounts();
            };
            
            vm.onParametersChanged = function () {
                recalculateTabCounts();
            };
            
            vm.createNewDraft = function () {
                var salesDraftInstance = new SDC.default(dataService);
                
                dataService.activateTab("Add product");
                
                salesDraftInstance.createDraft("orders").then(function (data) {
                    toastr.success(gettext("Sales order draft successfully created"));
                    
                    var orderId = data.salesOrder.salesOrderId;
                    
                    $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside();
                });
            };
        }
    ];
    
    return ngCoaListController;
});