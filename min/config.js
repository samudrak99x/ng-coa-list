define(["require","exports"],function(e,r){"use strict";return{dataSources:{orders:{url:"sales/orders?$orderBy=salesOrderId desc&$filter=Type ne RENTALORDER&$expand=HighlightedNotification,Management,TotalsConverted"},companySettings:{url:"base/companies/current/settings",autoBind:!1},customer:{url:"sales/customers/{customerId}"},customers:{url:"sales/customers"},items:{url:"sales/orders/{orderId}/items",autoBind:!1}},parameters:{orderId:{description:"Sales order identifier"}},appName:"ngCoaList",appNo:103012,lookupComponents:["CreateNewDocumentPopover","CustomerLookup"]}});