import prismadb from "@/lib/prismadb";

export const getGraphCustomers = async (storeId: string) => {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Create date range for last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    const year = currentYear - (monthIndex > currentMonth ? 1 : 0);
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0),
      monthIndex
    };
  });

  // Get customers grouped by month
  const customersByMonth = await Promise.all(
    months.map(async ({ start, end }) => {
      return await prismadb.customer.count({
        where: {
          storeId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });
    })
  );

  // Calculate cumulative totals
  let runningTotal = 0;
  const graphData = months.map(({ monthIndex }, i) => {
    runningTotal += customersByMonth[i];
    const year =  new Date().getFullYear();
    return {
    
      name: new Date(year, monthIndex).toLocaleString('default', { month: 'short' }),
      total: runningTotal
    };
  });

  return graphData;
};
