define(["require", "exports"], function (require, exports) {
    "use strict";
    var config = {
        dataSources: {
            orders: {
                url: "sales/orders?$orderBy=salesOrderId desc&$filter=Type ne RENTALORDER&$expand=HighlightedNotification,Management,TotalsConverted"
            },
            companySettings: {
                url: "base/companies/current/settings",
                autoBind: false
            },
            customer: {
                url: "sales/customers/{customerId}"
            },
            customers: {
                url: "sales/customers"
            },
            items: {
                url: "sales/orders/{orderId}/items",
                autoBind: false
            }
        },
        parameters: {
            orderId: {
                description: "Sales order identifier"
            }
        },
        appName: "ngCoaList",
        appNo: 103012,
        lookupComponents: [
            "CreateNewDocumentPopover",
            "CustomerLookup"
        ]
    };
    return config;
});
