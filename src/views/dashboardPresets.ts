import {
  archiveOutline,
  basketOutline,
  checkmarkDoneCircleOutline,
  leafOutline,
  peopleOutline,
  receiptOutline,
  timerOutline,
  trendingUpOutline,
} from 'ionicons/icons';

import type { PageData } from '../components/DashboardPage.vue';

export const dashboardOverviewPage: PageData = {
  hero: {
    eyebrow: 'Neychurlava operations',
    title: 'Dashboard Overview',
    description: 'A calm overview of today: orders, riders, service quality, and revenue signals.',
    primaryAction: 'Open dispatch',
    secondaryAction: 'Review reports',
    highlightValue: '3',
    highlightLabel: 'Pending Orders',
    trend: 'Steady across lunch and dinner rush',
  },
  metrics: [
    { label: 'Orders today', value: '128', detail: 'Today at a glance', icon: receiptOutline },
    { label: 'Delivered', value: '86', detail: 'Today at a glance', icon: checkmarkDoneCircleOutline },
    { label: 'Sales so far', value: 'PHP 28,460', detail: 'This week', icon: trendingUpOutline },
  ],
  mainSection: {
    kicker: 'What needs attention',
    title: 'Today at a glance',
    badge: 'Live',
    items: [
      { title: 'Dispatch backlog', meta: 'Orders waiting for rider assignment', status: 'Watch', value: '42 in queue' },
      { title: 'Prep time drift', meta: 'Two tickets delayed at wrap station', status: 'Check', value: '2 alerts' },
      { title: 'Zone delay', meta: 'South bypass affecting ETA', status: 'Note', value: '+6 min' },
    ],
  },
  sideSection: {
    kicker: 'Quick wins',
    title: 'Suggested moves',
    items: [
      { title: 'Rebalance riders', meta: 'Move 2 riders toward east zone', value: '10 min' },
      { title: 'Restock item', meta: 'Wrap leaves projected to run low', value: '18 packs' },
      { title: 'Boost attach rate', meta: 'Offer drink bundle for 2-3 PM dip', value: '+9%' },
    ],
  },
};

export const ordersPage: PageData = {
  hero: {
    eyebrow: 'Dispatch center',
    title: 'Orders Overview',
    description: 'See incoming requests, rider balance, and urgent deliveries in one clean command view.',
    primaryAction: 'Review queue',
    secondaryAction: 'Assign riders',
    highlightValue: '42',
    highlightLabel: 'Orders waiting for dispatch',
    trend: '12% faster than yesterday',
  },
  metrics: [
    { label: 'Incoming today', value: '128', detail: 'Peak hour starts at 5:30 PM', icon: receiptOutline },
    { label: 'Avg. prep time', value: '14 min', detail: 'Kitchen readiness is stable', icon: timerOutline },
    { label: 'Available riders', value: '18', detail: '4 riders near the east zone', icon: peopleOutline },
    { label: 'Priority orders', value: '7', detail: 'Marked for express handling', icon: basketOutline },
  ],
  mainSection: {
    kicker: 'Priority queue',
    title: 'Orders needing attention',
    badge: 'Live',
    items: [
      { title: 'Mango Grove Subdivision', meta: '3 items - Rider unassigned', status: 'Urgent', value: '12 min late' },
      { title: 'Riverside Market Block B', meta: 'Bulk lunch order - Ready for pickup', status: 'Dispatch', value: 'PHP 1,280' },
      { title: 'Hillcrest Residences', meta: 'Cash on delivery - Verify contact', status: 'Pending', value: 'PHP 640' },
    ],
  },
  sideSection: {
    kicker: 'Quick insights',
    title: 'Shift health',
    items: [
      { title: 'Best zone', meta: 'North route has the fastest handoff', value: '11 min avg' },
      { title: 'Rider balance', meta: 'Loads are spread evenly this hour', value: '3.2 orders each' },
      { title: 'Prep bottleneck', meta: 'Wrap station is slowing two tickets', value: '2 alerts' },
    ],
  },
};

export const deliveredTodayPage: PageData = {
  hero: {
    eyebrow: 'Completion pulse',
    title: 'Delivered Today',
    description: 'Track completed deliveries, fulfillment speed, and customer handoff quality throughout the day.',
    primaryAction: 'View completed drops',
    secondaryAction: 'Export summary',
    highlightValue: '86',
    highlightLabel: 'Successful deliveries completed',
    trend: '8% above the Wednesday average',
  },
  metrics: [
    { label: 'Success rate', value: '97%', detail: 'Only 2 orders needed follow-up', icon: checkmarkDoneCircleOutline },
    { label: 'Avg. delivery time', value: '24 min', detail: 'Down by 3 minutes', icon: timerOutline },
    { label: 'Top rider', value: 'Mika', detail: '14 completed trips', icon: peopleOutline },
    { label: 'Positive feedback', value: '31', detail: 'Most mentions cite speed and courtesy', icon: leafOutline },
  ],
  mainSection: {
    kicker: 'Completed recently',
    title: 'Latest successful drop-offs',
    badge: 'Updated',
    items: [
      { title: 'South Garden Villas', meta: 'Delivered by Carlo - Paid online', status: 'Complete', value: '21 min' },
      { title: 'Lakeside Office Hub', meta: '6 meal trays - Corporate account', status: 'Complete', value: '29 min' },
      { title: 'Pineview Apartments', meta: 'Customer received at lobby', status: 'Complete', value: '18 min' },
    ],
  },
  sideSection: {
    kicker: 'What changed',
    title: 'Service highlights',
    items: [
      { title: 'Fastest corridor', meta: 'West loop is clearing quickly', value: '16 min avg' },
      { title: 'Repeat customers', meta: 'Stronger lunch retention today', value: '22 orders' },
      { title: 'Follow-up needed', meta: 'One address pin should be corrected', value: '1 case' },
    ],
  },
};

export const productPage: PageData = {
  hero: {
    eyebrow: 'Menu performance',
    title: 'Todays Product',
    description: 'Highlight best sellers, low-stock items, and which products are shaping demand right now.',
    primaryAction: 'View menu trends',
    secondaryAction: 'Flag low stock',
    highlightValue: 'Kalabasa Wrap',
    highlightLabel: 'Top-selling product this shift',
    trend: '19 more units than the next item',
  },
  metrics: [
    { label: 'Items sold', value: '312', detail: 'Strong afternoon snack orders', icon: basketOutline },
    { label: 'Best seller', value: '43', detail: 'Kalabasa Wrap servings sold', icon: trendingUpOutline },
    { label: 'Low stock', value: '4', detail: 'Needs restock before dinner rush', icon: archiveOutline },
    { label: 'Bundle attach rate', value: '36%', detail: 'Drinks added more often today', icon: receiptOutline },
  ],
  mainSection: {
    kicker: 'Top movers',
    title: 'Products with the most traction',
    badge: 'Trending',
    items: [
      { title: 'Kalabasa Wrap', meta: 'Comfort food category - Strong repeat demand', status: 'Hot', value: '43 sold' },
      { title: 'Forest Herb Rice Bowl', meta: 'Popular with office lunch orders', status: 'Rising', value: '38 sold' },
      { title: 'Citrus Iced Tea', meta: 'Most attached beverage to combo meals', status: 'Steady', value: '57 add-ons' },
    ],
  },
  sideSection: {
    kicker: 'Stock watch',
    title: 'Inventory nudges',
    items: [
      { title: 'Wrap leaves', meta: 'Projected to last only until 7 PM', value: '18 packs left' },
      { title: 'Citrus base', meta: 'Order before evening promo starts', value: 'Low reserve' },
      { title: 'Sauce cups', meta: 'Enough for current queue only', value: '1.5 boxes' },
    ],
  },
};

export const salesPage: PageData = {
  hero: {
    eyebrow: 'Revenue garden',
    title: 'Sales Overview',
    description: 'Watch earnings, average basket size, and time-of-day patterns with a calmer, more readable layout.',
    primaryAction: 'Open sales report',
    secondaryAction: 'Compare periods',
    highlightValue: 'PHP 28,460',
    highlightLabel: 'Gross sales so far today',
    trend: '14% ahead of last week',
  },
  metrics: [
    { label: 'Average order value', value: 'PHP 331', detail: 'Higher due to bundle uptake', icon: receiptOutline },
    { label: 'Peak sales hour', value: '12 PM', detail: 'Lunch demand still dominates', icon: timerOutline },
    { label: 'Returning buyers', value: '41%', detail: 'Loyal customers remain healthy', icon: peopleOutline },
    { label: 'Promo uplift', value: 'PHP 4,180', detail: 'Combo deals lifted conversion', icon: trendingUpOutline },
  ],
  mainSection: {
    kicker: 'Revenue moments',
    title: "What is shaping today's sales",
    badge: 'Growing',
    items: [
      { title: 'Lunch combo wave', meta: 'Triggered by office cluster orders', status: 'Strong', value: 'PHP 9,240' },
      { title: 'Afternoon snack burst', meta: 'Tea and wrap pairing performed well', status: 'Improving', value: 'PHP 5,130' },
      { title: 'Delivery fee recovery', meta: 'Distance-based pricing held margins', status: 'Stable', value: 'PHP 2,480' },
    ],
  },
  sideSection: {
    kicker: 'Signals',
    title: 'Business snapshots',
    items: [
      { title: 'Highest margin item', meta: 'Forest Herb Rice Bowl is outperforming', value: '38%' },
      { title: 'Slow window', meta: 'Traffic dips between 2 and 3 PM', value: 'Needs promo' },
      { title: 'Upsell potential', meta: 'Dessert attach rate still has room', value: '+9%' },
    ],
  },
};

export const historyPage: PageData = {
  hero: {
    eyebrow: 'History archive',
    title: 'Delivery History',
    description: 'Review completed orders, spot patterns over time, and keep old delivery records easy to scan.',
    primaryAction: 'Browse records',
    secondaryAction: 'Filter dates',
    highlightValue: '1,284',
    highlightLabel: 'Deliveries stored this quarter',
    trend: 'Searchable by rider, zone, and date',
  },
  metrics: [
    { label: 'Archived this week', value: '246', detail: 'Logs synced without errors', icon: archiveOutline },
    { label: 'Repeat addresses', value: '64', detail: 'Useful for quick route planning', icon: peopleOutline },
    { label: 'Average historical ETA', value: '26 min', detail: 'Based on last 30 days', icon: timerOutline },
    { label: 'Resolved incidents', value: '12', detail: 'All delivery issues were closed', icon: checkmarkDoneCircleOutline },
  ],
  mainSection: {
    kicker: 'Recent history',
    title: 'Deliveries worth revisiting',
    badge: 'Archive',
    items: [
      { title: 'Elm Ridge Complex', meta: 'Recurring address with special instructions', status: 'Saved', value: '5 visits' },
      { title: 'Harbor Point Suites', meta: 'High-value order from weekend promo', status: 'Logged', value: 'PHP 2,140' },
      { title: 'Greenway Medical Center', meta: 'Large team lunch with split handoff', status: 'Filed', value: '32 min' },
    ],
  },
  sideSection: {
    kicker: 'Use the archive',
    title: 'Historical cues',
    items: [
      { title: 'Reliable address notes', meta: 'Lobby access info reduces failed attempts', value: '19 entries' },
      { title: 'Frequently delayed zone', meta: 'South bypass still affects ETAs', value: '6 cases' },
      { title: 'Top archived rider', meta: 'Carlo handled the most logged trips', value: '118 drops' },
    ],
  },
};
