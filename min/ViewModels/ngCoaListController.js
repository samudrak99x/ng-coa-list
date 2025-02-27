define(["../config", "../../106693 - Common.Framework.Extensions.TabItemsCountRbClass (5515)/ViewModels/TabItemsCountRbClassController", "../../107737 - Sales.SalesDraftRbClass (6343)/ViewModels/SalesDraftRbClassController"], function (m, f, p) {
    "use strict";
    return ["componentDataService", "newItemNotificationService", "gettext", "keyboardManagerService", "$scope", "$rootScope", "$timeout", function (componentDataService, newItemNotificationService, gettext, keyboardManagerService, $scope, $rootScope, $timeout) {
        var vm = this,
            instance = componentDataService.getInstance(this);

        function getDisplayName(person) {
            return person ? (person.firstName ? `${person.firstName} ${person.lastName}` : person.lastName) : "";
        }

        vm.currencyDatasource = [];
        vm.moreThanOneCurrencyAvailable = false;
        vm.moreThanOneAddressAvailable = false;
        vm.notificationParams = { objectType: "COA" };

        vm.dataSource = instance.CreateKendoDatasource({
            url: m.dataSources.orders.url,
            schema: {
                data: function (response) {
                    if (response.salesOrders) {
                        vm.currency = response.salesOrders.length > 0 ? `/${response.salesOrders[0].totalsConverted.currency}` : null;
                        response.salesOrders.forEach(order => {
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
                    }
                    return response.salesOrders;
                },
                total: function (response) {
                    return response.paging.size;
                },
                model: { id: "salesOrderId" }
            }
        });

        vm.onChange = function (event) {
            var selectedItem = event.sender.dataItem(event.sender.select());
            instance.changeUrlParameter("orderId", selectedItem.id);
        };

        vm.createNewParams = {
            module: "sales",
            objectType: "orders",
            documentCreated: function (orderId) {
                instance.changeUrlParameter("orderId", orderId);
                vm.dataSource.reloadCurrentPage();
                instance.activateTab("Items");
            }
        };

        vm.focus = function () {
            keyboardManagerService.bind("D", function () {
                $("#tsk_popoverCreateOrderBtn").trigger("click");
            });
        };

        vm.onHTMLLoaded = function () {
            $(document).ready(function () {
                $("#orders").next().find("button").after($("#tsk_popoverCreateOrderBtn"));
            });
            updateTabCounters();
        };

        vm.onParametersChanged = function () {
            updateTabCounters();
        };

        vm.createNewDraft = function () {
            const salesDraftController = new p.default(instance);
            instance.activateTab("Add product");
            salesDraftController.createDraft("orders").then(function (response) {
                toastr.success(gettext("Sales order draft successfully created"));
                var orderId = response.salesOrder.salesOrderId;
                $("[rb-splitter]").data("kendoSplitter").options.collapseFirstPaneFromOutside();
                instance.changeUrlParameter("orderId", orderId);
                vm.dataSource.reloadCurrentPage();
                $timeout(() => {
                    $rootScope.$broadcast("AddProduct_cleanQuickFilters");
                });
            });
        };

        vm.userNavigate = function (subId) {
            instance.rbNavigate("PER/" + subId, "subid=10");
        };

        var tabItems = [{ tabRef: "Items", url: m.dataSources.items.url, urlParameters: ["orderId"] }];
        let tabItemsCountController = new f.default(instance, tabItems);

        function updateTabCounters() {
            if (tabItemsCountController) {
                tabItemsCountController.setTabCounters();
            }
        }

        tabItemsCountController.setTabCounters();
        $scope.$on("onNewItemCreated", () => updateTabCounters());
    }];
});