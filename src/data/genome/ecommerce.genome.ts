// BrightBox Commerce — the e-commerce genome.
//
// Value proposition it has to make obvious: modeling across inventory, catalog, and fulfillment.
// So the process crosses all three deliberately — an order is received, paid for, reserved
// against inventory, packed, dispatched, and confirmed — and the product layer exposes the same
// nouns the operations layer names.
//
// Everything the /whats-your-dna page shows for E-commerce comes out of this file.

import type { AuthoredGenome } from '~/utils/genome-types';

export const ecommerce: AuthoredGenome = {
  key: 'ecommerce',
  ontologies: [
    { name: 'GS1', note: 'GTIN for trade items, GLN for locations, SSCC for shipping units.' },
    { name: 'EDI X12', note: 'The order-to-cash triple: 850 purchase order, 856 advance ship notice, 810 invoice.' },
    { name: 'schema.org', note: 'Order, OrderStatus, and Offer shapes for the storefront.' },
  ],
  domain: 'BrightBoxCommerce',
  domainPath: 'brightbox.commerce',
  orgName: 'BrightBox Commerce',
  description:
    'A direct-to-consumer retailer running its own catalog, inventory, and fulfillment from order placement through delivery confirmation.',

  resources: [
    {
      name: 'Order',
      description: 'A customer purchase, from placement through delivery confirmation.',
      attributes: [
        { name: 'orderNumber', type: 'string', required: true },
        { name: 'placedAt', type: 'datetime', required: true },
        { name: 'total', type: 'number', required: true },
        {
          name: 'status',
          type: 'enum',
          values: ['placed', 'paid', 'picking', 'shipped', 'delivered', 'cancelled'],
          required: true,
        },
      ],
      actions: [
        { name: 'Receive', type: 'write', description: 'Ingest a new order and validate its lines.' },
        { name: 'VerifyPayment', type: 'write', description: 'Confirm authorization before any stock moves.' },
        { name: 'Confirm', type: 'write', description: 'Close the order once delivery is confirmed.' },
      ],
    },
    {
      name: 'CatalogProduct',
      description: 'A sellable product with its merchandising copy, pricing, and variants.',
      attributes: [
        { name: 'gtin', type: 'string', required: true, description: 'GS1 Global Trade Item Number.' },
        { name: 'sku', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'published', type: 'boolean' },
      ],
      actions: [{ name: 'Publish', type: 'write', description: 'Make the product visible on the storefront.' }],
    },
    {
      name: 'InventoryItem',
      description: 'Stock of one SKU at one location, with the quantity currently reservable.',
      attributes: [
        { name: 'gtin', type: 'string', required: true, description: 'GS1 Global Trade Item Number.' },
        {
          name: 'gln',
          type: 'string',
          required: true,
          description: 'GS1 Global Location Number for the stocking site.',
        },
        { name: 'onHand', type: 'number', required: true },
        { name: 'reserved', type: 'number' },
      ],
      actions: [{ name: 'Reserve', type: 'write', description: 'Hold stock against a paid order.' }],
    },
    {
      name: 'Shipment',
      description: 'A packed parcel handed to a carrier against one or more order lines.',
      attributes: [
        { name: 'sscc', type: 'string', description: 'GS1 Serial Shipping Container Code.' },
        { name: 'trackingNumber', type: 'string' },
        { name: 'carrier', type: 'enum', values: ['UPS', 'FedEx', 'USPS', 'DHL'] },
        { name: 'dispatchedAt', type: 'datetime' },
      ],
      actions: [
        { name: 'Pack', type: 'write', description: 'Pick the lines and package them for the carrier.' },
        { name: 'Dispatch', type: 'write', description: 'Hand the parcel to the carrier and publish tracking.' },
      ],
    },
    {
      name: 'Return',
      description: 'A customer-initiated return against a delivered order.',
      attributes: [
        { name: 'reason', type: 'enum', values: ['damaged', 'wrong-item', 'no-longer-wanted', 'late'] },
        { name: 'receivedAt', type: 'datetime' },
        { name: 'refundAmount', type: 'number' },
      ],
      actions: [{ name: 'Authorize', type: 'write', description: 'Approve the return and issue an RMA.' }],
    },
  ],

  persons: [
    { name: 'Employee', description: 'Someone on the BrightBox payroll.' },
    { name: 'Customer', description: 'Someone who places orders on the storefront.' },
    { name: 'CarrierPartner', description: 'A contracted delivery carrier.' },
  ],

  roles: [
    {
      name: 'OperationsDirector',
      description: 'Owns end-to-end fulfillment performance, carrier relationships, and SLA commitments.',
    },
    {
      name: 'OrderManager',
      parent: 'OperationsDirector',
      description: 'Processes incoming orders, validates payments, and sets warehouse priority.',
    },
    {
      name: 'WarehouseLead',
      parent: 'OperationsDirector',
      description: 'Directs pick-and-pack, owns inventory accuracy, and oversees outbound shipments.',
    },
    {
      name: 'CustomerSupportLead',
      parent: 'OperationsDirector',
      description: 'Handles delivery inquiries, manages returns, and resolves post-shipment exceptions.',
    },
    {
      name: 'MerchandisingManager',
      parent: 'OperationsDirector',
      description: 'Owns the catalog — what is listed, how it is priced, and when it goes live.',
    },
  ],

  groups: [
    { name: 'FulfillmentTeam', description: 'Everyone who touches an order between payment and dispatch.' },
    { name: 'SupportTeam', description: 'Everyone who talks to a customer after dispatch.' },
  ],

  memberships: [
    { name: 'EmployeeAsOrderManager', person: 'Employee', role: 'OrderManager', group: 'FulfillmentTeam' },
    { name: 'EmployeeAsWarehouseLead', person: 'Employee', role: 'WarehouseLead', group: 'FulfillmentTeam' },
    { name: 'EmployeeAsSupportLead', person: 'Employee', role: 'CustomerSupportLead', group: 'SupportTeam' },
    { name: 'EmployeeAsMerchandiser', person: 'Employee', role: 'MerchandisingManager' },
  ],

  operations: [
    { target: 'Order', action: 'Receive', description: 'Ingest the order and validate its line items.' },
    { target: 'Order', action: 'VerifyPayment', description: 'Confirm payment authorization.' },
    { target: 'Order', action: 'Confirm', description: 'Close the order after delivery.' },
    { target: 'Order', action: 'List', description: 'List orders for an operator queue.' },
    { target: 'Order', action: 'Read', description: 'Read one order in full.' },
    { target: 'InventoryItem', action: 'Reserve', description: 'Hold stock against a paid order.' },
    { target: 'InventoryItem', action: 'List', description: 'List stock positions by location.' },
    { target: 'Shipment', action: 'Pack', description: 'Pick and package the order lines.' },
    { target: 'Shipment', action: 'Dispatch', description: 'Hand off to the carrier with tracking.' },
    { target: 'Shipment', action: 'Track', description: 'Read carrier tracking for a shipment.' },
    { target: 'CatalogProduct', action: 'Publish', description: 'Make a product live on the storefront.' },
    { target: 'Return', action: 'Authorize', description: 'Approve a return and issue an RMA.' },
  ],

  process: {
    name: 'OrderFulfillment',
    description: 'Placement through delivery confirmation, across catalog, inventory, and fulfillment.',
    operator: 'OperationsDirector',
    steps: [
      {
        id: 'receive-order',
        title: 'Receive order',
        actor: 'OrderManager',
        operation: 'Order.Receive',
        description: 'Ingest the order, validate line items, and confirm the SKUs are sellable.',
      },
      {
        id: 'verify-payment',
        title: 'Verify payment',
        actor: 'OrderManager',
        operation: 'Order.VerifyPayment',
        description: 'Confirm authorization; hold or decline anything the processor flags.',
        consulted: ['CustomerSupportLead'],
      },
      {
        id: 'reserve-inventory',
        title: 'Reserve inventory',
        actor: 'WarehouseLead',
        operation: 'InventoryItem.Reserve',
        description: 'Hold stock at the fulfilling location and trigger replenishment if it goes short.',
        consulted: ['MerchandisingManager'],
      },
      {
        id: 'pick-and-pack',
        title: 'Pick & pack',
        actor: 'WarehouseLead',
        operation: 'Shipment.Pack',
        description: 'Retrieve the items, verify quantities, and package for the carrier.',
      },
      {
        id: 'dispatch-shipment',
        title: 'Dispatch shipment',
        actor: 'WarehouseLead',
        operation: 'Shipment.Dispatch',
        description: 'Generate the label, hand off to the carrier, and publish tracking to the order.',
        consulted: ['OrderManager'],
      },
      {
        id: 'confirm-delivery',
        title: 'Confirm delivery',
        actor: 'CustomerSupportLead',
        operation: 'Order.Confirm',
        description: 'Verify carrier confirmation, close the order, and open the post-purchase follow-up.',
      },
    ],
  },

  rules: [
    {
      name: 'PaymentClearsBeforeStockMoves',
      operation: 'InventoryItem.Reserve',
      ruleType: 'condition',
      description: 'No stock is reserved until payment authorization has cleared.',
    },
    {
      name: 'OnlyWarehouseDispatches',
      operation: 'Shipment.Dispatch',
      ruleType: 'access',
      description: 'Dispatch is the warehouse’s call. Support can ask; it cannot ship.',
      allow: [{ role: 'WarehouseLead' }, { role: 'OperationsDirector' }],
    },
    {
      name: 'ReturnsAreSupportsToApprove',
      operation: 'Return.Authorize',
      ruleType: 'access',
      description: 'Only support authorizes returns, so refund exposure has one owner.',
      allow: [{ role: 'CustomerSupportLead' }, { role: 'OperationsDirector' }],
    },
    {
      name: 'CatalogGoesLiveThroughMerchandising',
      operation: 'CatalogProduct.Publish',
      ruleType: 'access',
      description: 'Nothing reaches the storefront without merchandising publishing it.',
      allow: [{ role: 'MerchandisingManager' }],
    },
  ],

  triggers: [
    { source: 'user', process: 'OrderFulfillment', description: 'A customer completes checkout.' },
    {
      source: 'schedule',
      operation: 'InventoryItem.Reserve',
      schedule: '*/15 * * * *',
      description: 'Sweep for paid orders whose stock could not be held on the first pass.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Order',
        resource: 'Order',
        description: 'The operator-facing order record.',
        fields: [
          { name: 'orderNumber', label: 'Order', type: 'string', required: true, readonly: true },
          { name: 'customer', label: 'Customer', type: 'string', required: true },
          { name: 'placedAt', label: 'Placed', type: 'datetime', required: true, readonly: true },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: ['placed', 'paid', 'picking', 'shipped', 'delivered', 'cancelled'],
            required: true,
          },
          { name: 'total', label: 'Total', type: 'number', required: true },
        ],
        actions: [{ name: 'VerifyPayment' }, { name: 'Confirm' }],
        samples: [
          {
            orderNumber: 'BB-10482',
            customer: 'A. Okafor',
            placedAt: '2026-08-14 09:12',
            status: 'shipped',
            total: 128.4,
          },
          {
            orderNumber: 'BB-10483',
            customer: 'M. Lindqvist',
            placedAt: '2026-08-14 09:26',
            status: 'picking',
            total: 64.0,
          },
          {
            orderNumber: 'BB-10484',
            customer: 'R. Patel',
            placedAt: '2026-08-14 10:03',
            status: 'paid',
            total: 219.95,
          },
          {
            orderNumber: 'BB-10485',
            customer: 'J. Moreau',
            placedAt: '2026-08-14 10:41',
            status: 'placed',
            total: 42.5,
          },
        ],
      },
      {
        name: 'CatalogProduct',
        resource: 'CatalogProduct',
        description: 'A product as merchandising maintains it.',
        fields: [
          { name: 'sku', label: 'SKU', type: 'string', required: true, readonly: true },
          { name: 'title', label: 'Title', type: 'string', required: true },
          { name: 'price', label: 'Price', type: 'number', required: true },
          { name: 'published', label: 'Live', type: 'boolean' },
        ],
        actions: [{ name: 'Publish' }],
        samples: [
          { sku: 'BX-CRT-01', title: 'Utility Crate, Small', price: 24.0, published: true },
          { sku: 'BX-CRT-02', title: 'Utility Crate, Large', price: 38.0, published: true },
          { sku: 'BX-LID-01', title: 'Crate Lid', price: 9.5, published: false },
        ],
      },
      {
        name: 'InventoryItem',
        resource: 'InventoryItem',
        description: 'Stock position by SKU and location.',
        fields: [
          { name: 'sku', label: 'SKU', type: 'string', required: true, readonly: true },
          { name: 'location', label: 'Location', type: 'string', required: true },
          { name: 'onHand', label: 'On hand', type: 'number', required: true },
          { name: 'reserved', label: 'Reserved', type: 'number' },
        ],
        samples: [
          { sku: 'BX-CRT-01', location: 'DSM-1', onHand: 412, reserved: 38 },
          { sku: 'BX-CRT-02', location: 'DSM-1', onHand: 96, reserved: 12 },
          { sku: 'BX-LID-01', location: 'RNO-2', onHand: 0, reserved: 0 },
        ],
      },
      {
        name: 'Shipment',
        resource: 'Shipment',
        description: 'An outbound parcel and its carrier state.',
        fields: [
          { name: 'trackingNumber', label: 'Tracking', type: 'string', readonly: true },
          { name: 'carrier', label: 'Carrier', type: 'enum', values: ['UPS', 'FedEx', 'USPS', 'DHL'] },
          { name: 'dispatchedAt', label: 'Dispatched', type: 'datetime' },
        ],
        actions: [{ name: 'Dispatch' }],
        samples: [
          { trackingNumber: '1Z999AA10123', carrier: 'UPS', dispatchedAt: '2026-08-14 16:20' },
          { trackingNumber: '9400110200881', carrier: 'USPS', dispatchedAt: '2026-08-14 16:55' },
        ],
      },
    ],
    namespace: {
      name: 'Commerce',
      path: '/api/commerce',
      description: 'Order, catalog, inventory, and shipment operations.',
    },
    endpoints: [
      { method: 'GET', path: '/orders', operation: 'Order.List', description: 'The operator order queue.' },
      { method: 'GET', path: '/orders/{id}', operation: 'Order.Read', description: 'One order in full.' },
      {
        method: 'POST',
        path: '/orders/{id}/verify-payment',
        operation: 'Order.VerifyPayment',
        description: 'Confirm authorization for an order.',
      },
      { method: 'GET', path: '/inventory', operation: 'InventoryItem.List', description: 'Stock by location.' },
      {
        method: 'POST',
        path: '/inventory/reserve',
        operation: 'InventoryItem.Reserve',
        description: 'Hold stock against a paid order.',
      },
      {
        method: 'POST',
        path: '/shipments/{id}/dispatch',
        operation: 'Shipment.Dispatch',
        description: 'Hand a packed parcel to the carrier.',
      },
      { method: 'GET', path: '/shipments/{id}', operation: 'Shipment.Track', description: 'Carrier tracking state.' },
      {
        method: 'POST',
        path: '/catalog/{id}/publish',
        operation: 'CatalogProduct.Publish',
        description: 'Publish a product to the storefront.',
      },
    ],
    layout: { name: 'AdminShell', type: 'sidebar' },
    pages: [
      {
        name: 'OrderQueue',
        resource: 'Order',
        description: 'Every open order, oldest first.',
        blocks: [
          { name: 'OrderTable', type: 'table', operation: 'Order.List' },
          { name: 'StatusFilter', type: 'summary' },
        ],
      },
      {
        name: 'OrderDetail',
        resource: 'Order',
        description: 'One order, with payment and shipment state.',
        blocks: [
          { name: 'OrderForm', type: 'form', operation: 'Order.Read' },
          { name: 'VerifyPaymentAction', type: 'actions', operation: 'Order.VerifyPayment' },
        ],
      },
      {
        name: 'InventoryBoard',
        resource: 'InventoryItem',
        description: 'Stock positions with reservation pressure.',
        blocks: [{ name: 'InventoryTable', type: 'table', operation: 'InventoryItem.List' }],
      },
      {
        name: 'CatalogEditor',
        resource: 'CatalogProduct',
        description: 'Merchandising’s working surface.',
        blocks: [{ name: 'PublishAction', type: 'actions', operation: 'CatalogProduct.Publish' }],
      },
    ],
    routes: [
      { path: '/orders', page: 'OrderQueue', protected: true, description: 'Operator order queue.' },
      { path: '/orders/:id', page: 'OrderDetail', protected: true, description: 'Single order.' },
      { path: '/inventory', page: 'InventoryBoard', protected: true, description: 'Stock positions.' },
      { path: '/catalog', page: 'CatalogEditor', protected: true, description: 'Catalog management.' },
    ],
  },

  technical: {
    providers: [
      { name: 'Vercel', type: 'cloud', description: 'Storefront and admin hosting.', region: 'iad1' },
      { name: 'Neon', type: 'database', description: 'Primary Postgres for orders and catalog.', region: 'us-east-2' },
      { name: 'Stripe', type: 'payments', description: 'Authorization and capture.' },
      { name: 'Auth0', type: 'auth', description: 'Operator identity for the admin surfaces.' },
    ],
    environments: [
      { name: 'dev', description: 'Local and preview builds.', providers: ['Vercel', 'Neon'] },
      { name: 'staging', description: 'Carrier sandbox and test payments.', providers: ['Vercel', 'Neon', 'Stripe'] },
      { name: 'prod', description: 'Live storefront.', providers: ['Vercel', 'Neon', 'Stripe', 'Auth0'] },
    ],
    cells: [
      {
        name: 'Storefront',
        dna: 'BrightBoxCommerce.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'Customer-facing catalog and checkout.',
      },
      {
        name: 'OrderService',
        dna: 'BrightBoxCommerce.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Order lifecycle and payment verification.',
      },
      {
        name: 'InventoryService',
        dna: 'BrightBoxCommerce.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Stock positions and reservations.',
      },
      {
        name: 'FulfillmentWorker',
        dna: 'BrightBoxCommerce.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Runs the pick, pack, and dispatch steps against carrier APIs.',
      },
      {
        name: 'CommerceDb',
        dna: 'BrightBoxCommerce.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Orders, catalog, inventory, shipments.',
      },
    ],
    connections: [
      { source: 'Storefront', target: 'OrderService', type: 'data-flow', label: 'checkout' },
      { source: 'OrderService', target: 'InventoryService', type: 'depends-on', label: 'reserve' },
      { source: 'OrderService', target: 'FulfillmentWorker', type: 'publishes-to', label: 'order.paid' },
      { source: 'FulfillmentWorker', target: 'InventoryService', type: 'communicates-with', label: 'decrement' },
      { source: 'OrderService', target: 'CommerceDb', type: 'depends-on' },
      { source: 'InventoryService', target: 'CommerceDb', type: 'depends-on' },
    ],
  },
};

export default ecommerce;
