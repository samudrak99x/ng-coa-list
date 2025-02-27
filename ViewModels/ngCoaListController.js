define(['../config', "../../106693 - Common.Framework.Extensions.TabItemsCountRbClass (5515)/ViewModels/TabItemsCountRbClassController", "../../107737 - Sales.SalesDraftRbClass (6343)/ViewModels/SalesDraftRbClassController"],
function (config, TabItemsCount, SalesDraft) {
    'use strict';
	var ngCoaListController = ['componentDataService', 'newItemNotificationService', 'gettext', 'keyboardManagerService', '$scope', '$rootScope', '$timeout', function (componentDataService, newItemNotificationService, gettext, keyboardManagerService, $scope ,$rootScope, $timeout) {
        var vm = this;
        var ds = componentDataService.getInstance(this);
        var customerAccount = "";
        
        vm.currencyDatasource = [];
        vm.moreThanOneCurrencyAvailable = false;
        vm.moreThanOneAddressAvailable = false;
                
        vm.notificationParams = {
            objectType: "COA"
        };
        
        vm.dataSource = ds.CreateKendoDatasource({
            url: config.dataSources.orders.url,
            schema:{
                data: function(data) {
                    if(data.salesOrders) {
                        vm.currency = data.salesOrders && data.salesOrders.length > 0 ? `/${data.salesOrders[0].totalsConverted.currency}` : null;
                        data.salesOrders.forEach(order => {
                            if(order.management) {
                                order.management.planner.displayName = getDisplayName(order.management.planner);
                                order.management.projectLeader.displayName = getDisplayName(order.management.projectLeader);
                                order.management.documentController.displayName = getDisplayName(order.management.documentController);
                            } 
                            else{
                                order.management = {
                                    planner: {
                                        displayName: ""
                                    },
                                    projectLeader:{
                                        displayName: ""
                                    },
                                    documentController: {
                                        displayName: ""
                                    }
                                };

                            }
                        });
                        return data.salesOrders;
                    }
                },
                total: function(data){
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
            documentCreated: function (newSalesOrderId){
                ds.changeUrlParameter("orderId", newSalesOrderId);                   
                vm.dataSource.reloadCurrentPage();
                
                ds.activateTab("Items");
            }
        }

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
        }

        vm.onParametersChanged = function() {
            recalculateTabCounts();
        }


        vm.createNewDraft = function () {
            const salesDraft = new SalesDraft.default(ds);
            
            ds.activateTab("Add product");

            salesDraft.createDraft("orders").then(function (data) {

                toastr.success(gettext("Sales order draft successfully created"));
                let orderId = data.salesOrder.salesOrderId;
                
                $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside()

                ds.changeUrlParameter("orderId", orderId);
                vm.dataSource.reloadCurrentPage();
                
                $timeout(() => {
                    $rootScope.$broadcast('AddProduct_cleanQuickFilters');
                });
            });
        }

        vm.userNavigate = function(userId) {
          ds.rbNavigate("PER/" + userId, "subid=10");
        }
    
        function getDisplayName(employee) {
          if (!employee)
            return '';
          
          if (employee.firstName)
            return `${employee.firstName} ${employee.lastName}`;
          
          return employee.lastName;
        }

        //#region tabCount
        const tabCountDefinitions = [
            { tabRef: "Items", url: config.dataSources.items.url, urlParameters: ["orderId"] }
        ];
    
        let tabItemsCount = new TabItemsCount.default(ds, tabCountDefinitions);
        tabItemsCount.setTabCounters();
    
        function recalculateTabCounts() {
            if (tabItemsCount) {
                tabItemsCount.setTabCounters();
            }
        };

        $scope.$on("onNewItemCreated", () => recalculateTabCounts());
    
        //#endregion tabCount
    }];

    return ngCoaListController;
});
