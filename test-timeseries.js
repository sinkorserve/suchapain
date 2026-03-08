// Simple test for timeseries logic
const now = new Date();
const range = '1Y';
const rangeMap = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '5Y': 365 * 5
};
const daysBack = rangeMap[range] || 365;
const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

console.log('Start date:', startDate);
console.log('End date:', now);
console.log('Days back:', daysBack);

// Test the loop
const filledData = [];
const currentDate = new Date(startDate);
const maxDays = daysBack + 1;
let dayCount = 0;

while (currentDate <= now && dayCount < maxDays) {
  const dateKey = currentDate.toISOString().split('T')[0];
  filledData.push({ date: dateKey, count: 0, categories: {} });
  
  currentDate.setDate(currentDate.getDate() + 1);
  dayCount++;
  
  if (dayCount % 50 === 0) {
    console.log(`Processed ${dayCount} days...`);
  }
}

console.log('Total data points:', filledData.length);
console.log('First date:', filledData[0]?.date);
console.log('Last date:', filledData[filledData.length - 1]?.date);
