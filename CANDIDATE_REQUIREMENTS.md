# Interview Task: Order Data Dashboard

**Time Limit: ≈ 1-2 hours of hands-on coding**

## Overview

You'll build a data visualization dashboard using realistic order data. We've provided the complete data infrastructure (hooks → actions → data layer) - your focus is on the UI and data transformation layer.

**What we're evaluating:**

- React + TypeScript proficiency
- UI/UX judgment for making data actionable
- Code organization and reusability
- Prioritization under time constraints

## Time-Boxing & Development Approach

We respect your time. Please **stop after ≈ 2 hours of hands-on coding**. It is expected that after 1-2 hours there will be features you want to polish or optimizations you want to make. That is **perfectly OK** – document these thoughts in your summary at the end.

### Recommended Approach:

- **Leverage AI development tools heavily** (Claude, Cursor, Windsurf, GitHub Copilot, etc.)
- Focus on core functionality first, polish later
- Time-box decisions (don't spend 30 minutes picking a chart library)

### Acceptable Shortcuts:

- Use pre-built component libraries rather than building from scratch
- Use any charting library you're comfortable with
- Focus on the happy path, skip edge case handling
- Basic styling is fine - functional > beautiful

## The Data

You're working with **Orders** and **OrderLineItems**:

```typescript
Order {
  orderNumber: string;
  storeName: string;
  orderDate: Date;
  lineItems: OrderLineItem[];
}

OrderLineItem {
  orderNumber: string;
  itemNumber: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // totalPrice = unitPrice * quantity
}
```

Full type definitions: [`types/order.ts`](types/order.ts)

The app generates deterministic fake data:

- 200 unique items
- 10 stores
- 15 suppliers
- Some logic for order frequencies and pricing

## Core Requirements (Pick Your Battles!)

**You should complete at least 2 of the following 3:**

### 1. Data Table

Display orders in a sortable table with key columns:

- Order Number
- Store Name
- Order Date
- Total Amount
- Number of Line Items

**Why we care:** Can you present tabular data clearly? Do you handle sorting and display well?

### 2. Filtering

Add at least **one** working filter:

- Store Name filter (dropdown or multi-select)
- OR Supplier Name filter (from line items)

**Why we care:** Can you work with nested data structures? How do you handle state?

### 3. Visualization

Create **one** meaningful chart showing:

- Daily order totals over the date range
- OR orders by store
- OR another metric you find interesting

**Why we care:** Can you transform data for visualization? How do you choose what to show?

## Evaluation Criteria

| What We're Looking For | What We Care About                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Core Functionality** | At least 2 of the 3 requirements work; data displays correctly; interactions function as expected |
| **Code Quality**       | Clean React patterns; reusable components; proper TypeScript usage; reasonable state management   |
| **UI/UX**              | Intuitive interface; clear data presentation; responsive design\*; visual feedback                |
| **Time Management**    | Smart prioritization; documented TODOs; realistic scope for 1-2 hours                               |

\* Responsive within typical desktop browser sizes - no need for full mobile support

### Don't Worry About:

❌ Perfect styling (functional > beautiful)  
❌ Edge cases (focus on happy path)  
❌ Tests (we know you're time-constrained)  
❌ Performance optimization (unless obvious)

## Getting Started

The infrastructure is ready:

```typescript
// Fetch orders for a date range
const { data: orders, isLoading } = useOrders(startDate, endDate);

// Helper functions available in actions
getStoreNames(); // All store names
getSupplierNames(); // All supplier names
getItemNumbers(); // All item numbers
```

**Your code goes in:**

- New components in `components/` (create subdirectories as needed)
- Replace the demo content in `app/page.tsx`

## Libraries

Feel free to install any libraries you're comfortable with:

- **Tables:** TanStack Table, AG Grid, or build your own
- **Charts:** Recharts, Chart.js, Victory, D3, Nivo
- **UI:** Any component library or stick with Tailwind CSS

## Deliverables

Submit your solution as a **Git repository** (GitHub link preferred) or **zip file** containing:

1. **Working code** that runs with `npm run dev`
2. **Brief comments** on complex logic (inline or in code)
3. **A short summary** (add to the bottom of this file):
   - What you built (which core features you chose)
   - Key decisions you made
   - What you'd add with more time

## Tips

- **Start simple** - Get one thing working well, then add more
- **Use the console** - The demo page logs all data, check the structure
- **Partial > perfect** - A working table beats an unfinished table + broken chart
- **Document trade-offs** - If you skip something, explain why in your summary
- **Ask questions** - If something is unclear, reach out!

## Questions?

If something is unclear:

- Check the browser console for data examples
- Review [`types/order.ts`](types/order.ts) for the data structure
- Look at the existing demo in [`app/page.tsx`](app/page.tsx)
- Email us - this is meant to be a straightforward exercise

---

## Your Summary

#### What I built

- The Order History data table displays orders data for the selected time range. It includes sortable headers and expandable nested tables that display all `lineItems` for a specified `Order`.
- The table is filterable by `storeName` and `supplierName`, with multi-select support for each.
- Below the table is a line chart displaying the total orders by day in the selected time range. The chart is responsive and data points are hoverable, displaying exact date and order total

#### Key Decisions (chronological order)

- Set priorities:
  - Build table
  - Add filtering
  - Evaluate implementation and refine
  - Build chart
  - Evalutate implementation and clean up design/responsiveness
- I chose the [@tanstack/react-table](https://www.npmjs.com/package/@tanstack/react-table) library for the Order History table as it's headless, performant, and I have familiarity with Tanstack's suite of libraries. Requirements were very clear, so the implementation with Claude was straightforward
- After minimal tweaking, I moved onto the filter dropdowns. Again, requirements were very clear, so I piped those in to Claude and verified the result. I manually extracted the MultiSelectFilter from the orders-table file into its own UI component as it is more general-purpose.
- At this point, the basic requirements of the data table and filtering were satisfied, so I turned my attention to refining the UX:
  - From a design perspective, the important considerations for data tables, espeically in the context of a multi-faceted dashboard, are mostly related to visibility, both of aspects of the table itself as well as other components in the dashboard. Tables with the potential for any more than a dozen or so entries should be truncated in some way (whether by pagination or overflow/scroll) for better visibility/navigation of the rest of the dashboard. I find scroll to be less interruptive to quick parsing of data than setting up hard data breaks with pagination, so I added a max height and overflow behavior. With scrolling, it's important to maintain visibility of the table header as it provides context to the rest of the data in the table, so I added `position: sticky` to the `<th>` element.
  - From a data perspective, I took a look at what unused data may be important to a potential user of this dashboard. If I were looking at this table of orders, I thought it may be useful to be able to see a breakdown of the individual `lineItems` that make up a specified `Order`, so I created expandable, nested tables for each row displaying that info. This also had the added benefit of making the supplier filter functionality clearer, as the data being used to filter the table was no longer hidden. I re-evaluated the table after this change and noticed some performance issues around how the un-memoized expandable sections were causing unnecessary re-renders of the entire table, introducing noticeable lag, so I extracted and memoized the ExpandableRow component
- I chose [nivo](https://www.npmjs.com/package/@nivo/core) as the charting library mainly due to my own familiarity. I originally gravitated to it because it supports one of the widest varieties of chart types compared to other libraries, which makes it more adapatable and less likely to need to be replaced in the future. I chose a line graph (as opposed to a bar chart) as the order data is sequential and semi-related, and line charts more effectively visualize current/future trends
- Claude struggled to transform the input orders data properly causing incorrect date formatting and display bugs, so I had to step in to define the transformation function and reconfigure some of the chart settings

#### Takeaways and Future Development

- I gave myself a strict 2-hour time limit for the hands-on coding portion. The bugs I encountered with charting definitely pushed that limit towards the end, but otherwise, I felt comfortable fulfilling the requirements of the assignment within that timeframe
- I chose to refine and extend the functionality of the data table **before** implementing a basic version of the chart. While I think the addition of the expandable rows was worth it, I should have prioritized fulfilling all of the baseline requirements of the assignment before moving on to *extra credit* based on my own assumptions of the user's goals, especially since the chart implementation ended up more time-consuming than originally estimated
- Anticipating potentially larger datasets for wider date ranges, it would be good to test performance of the table with 1000s+ rows and implement appropriate lazy-rendering for rows below the fold.
- For the data table filtering, I would make two changes (and add one pedantic note):
  - Currently, store and supplier names listed in the dropdowns are parsed directly from the fetched data, which is not ideal. Simulated endpoints for fetching a full list of suppliers and stores were provided, so I would use those directly. This would ensure consistent UX across different date ranges, preventing some suppliers and stores being left out, which could be confusing to a user. Filtering by a store/supplier without matching entries would display a more informative "No results matched your search"
  - The actual filtering of data current occurs fully client-side, but the simulated backend provides filter query parameters. I would adapt the `useOrders` hook to accept these filter parameters directly, which would allow for optimized search caching, especially important for larger datasets. Since the filters support multi-select, I would make sure to give extra attention to how those filters were serialized for use in the `useQuery` `queryKey`.
  - Least importantly, I noticed the supplier dropdown was organizing the suppliers alphabetically, which resulted in "Supplier 10" being listed before "Supplier 2". Obviously these are placeholder names, so actual data wouldn't have this quirk, but it bothered me enough to add a note about it here: Assuming the backend supplier list is unsorted, I would add some basic parsing function to sort those more intuitively.
- For the chart, I chose to do the most basic option, which was to display total orders per day. While this is a potentially useful visual indicator of sales trends, there was a lot of potential to amplify this part of the dashboard. As a specific example, I think a hybrid line + bar chart showing total sales per day along with total $ value of orders per day could provide more insight at a glance.
- I really deprioritized styling and accessibility, settling for good-enough component design and basic theming. Aesthetics are definitely lowest on the priority list, but with more time I would put minimal viable effort into adding more contrast and clearly delineating CTAs. It would also be ideal to use radix primitives for things like the filter dropdowns for better accessibility.
- For DX
  - I noticed the eslint configuration was not being loaded properly in my IDE, so there's potential for formatting/syntax issues if this fork were to be merged and expected as-is to pass any auto-linting during established CI/CD pipelines. I would spend some time ensuring my potential PR was fully merge-ready.
  - I'm usually better about documenting code with comments, TODOs, and more human-readable naming conventions, but I sacrificed a bit of that to focus more time on functionality.
- Miscellaneous
  - Order ids were made up of "ORD", the date, and the actual order number, so I could add some string manipulation there to display only the important part of the data more clearly. Same with item ids
  - I would update the sorting arrows in the table headers to more clearly indicate ascending vs descending sorting
  - I would expand the loading state of the entire dashboard to retain a skeleton view of the layout as opposed to removing everything to display a spinner. This establishes better visual consistency for a user, so they can navigate to the data container they're interested in before the data is actually available

---

Good luck, and happy coding! 🚀
