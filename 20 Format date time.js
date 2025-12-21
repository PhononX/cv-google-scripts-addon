function formatDateTime(userTimeZone, dateString) {

  const validation = isValidDateTime(dateString);
  if (validation.status === false){
    return validation.message;
  }

  const date = new Date(dateString);
  //const formattedDate1 = Utilities.formatDate(date, userTimeZone, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'',);
  const now = new Date();

  const formatterTime = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  function formatTime1(date) {
    return formatterTime.format(date);
  }

  // Helper function to format time
  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }


  // Logger.log('date.toDateString() ' + date.toDateString());
  // Logger.log('now.toDateString() ' + now.toDateString());


  function onlyDate(date) {
    return Utilities.formatDate(date, userTimeZone, 'yyyy-MM-dd');
  }

  // Check if the date is today or yesterday
  // const isToday = date.toDateString() === now.toDateString();
  const isToday = onlyDate(date) === onlyDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  // const isYesterday = date.toDateString() === yesterday.toDateString();
  const isYesterday = onlyDate(date) === onlyDate(yesterday);

  if (isToday) {
    return `Today · ${formatTime1(date)}`;
  } else if (isYesterday) {
    return `Yesterday · ${formatTime1(date)}`;
  } else {
    // Format the date as "Nov 5"
    const options = { month: 'short', day: 'numeric' };
    // const formattedDate = date.toLocaleDateString(undefined, options);
    const formattedDate = Utilities.formatDate(date, userTimeZone, 'MMM d');
    // 🌐 
    return `${formattedDate} · ${formatTime1(date)}`;
  }
}

function msToMinSec(ms) {
  // Check if input is valid
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return '0:00';
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTimezoneOffset() {
  const timezone = getTimeZoneValue();
  const now = new Date();

  // Format the date in the specified timezone
  const formattedDate = Utilities.formatDate(now, timezone, "Z");
  // Logger.log(formattedDate);
  // Logger.log(formattedDate * 60 / 100);
  return formattedDate * 60 / 100;
}

function getTimezoneOffset2() {
  const timezone = getTimeZoneValue();
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, timezone, "Z");
  return formattedDate;
}

function getToday2350() {
  // return "2024-12-23T23:50:00.000+0400"
  const timezone = getTimeZoneValue();
  const now = new Date();
  return Utilities.formatDate(now, timezone, "yyyy-MM-dd") + "T23:50:00.000" + getTimezoneOffset2()
}

function getTomorrow1000() {
  // return "2024-12-23T23:50:00.000+0400"
  const timezone = getTimeZoneValue();
  const now = new Date();
  const tomorrowMs = now.getTime() + 60 * 60 * 24 * 1000;
  return Utilities.formatDate(new Date(tomorrowMs), timezone, "yyyy-MM-dd") + "T10:00:00.000" + getTimezoneOffset2()
}

function getFriday2000() {
  const timezone = getTimeZoneValue();
  const now = new Date();
  const dayNumberOfWeek = Utilities.formatDate(now, timezone, "u");
  const daysUntilFriday = (5 + 7 - dayNumberOfWeek) % 7;
  const fridayMs = now.getTime() + daysUntilFriday * 60 * 60 * 24 * 1000;
  return Utilities.formatDate(new Date(fridayMs), timezone, "yyyy-MM-dd") + "T20:00:00.000" + getTimezoneOffset2()
}


function isValidDateTime(dateTime) {
  
  // Check for null/undefined
  if (dateTime == null) {
    return {status: false, message: 'Error. Invalid timestamp ' + dateTime};
  }
  
  // Handle Date objects
  if (dateTime instanceof Date) {
    if (isNaN(dateTime.getTime())) {
      return {status: false, message: 'Error. Invalid timestamp (Invalid Date object)'};
    }
    return {status: true, message: 'Valid'};
  }
  
  // Handle strings
  if (typeof dateTime === 'string') {
    // Check for empty or whitespace-only strings
    if (dateTime.trim() === '') {
      return {status: false, message: 'Error. Invalid timestamp (empty string)'};
    }
    
    // Try to parse the date string
    const date = new Date(dateTime);
    
    // If parsing fails, it's invalid
    if (isNaN(date.getTime())) {
      return {status: false, message: 'Error. Invalid timestamp ' + dateTime};
    }
    
    return {status: true, message: 'Valid'};
  }
  
  return {status: false, message: 'Error. Invalid timestamp (wrong type)'};
}

// Test array with input and expected output
const testArrayDateTime = [
  // Valid cases
  { input: new Date('2025-12-14'), expected: true, description: 'Valid Date object' },
  { input: '2025-12-14', expected: true, description: 'Valid YYYY-MM-DD format' },
  { input: '2025-12-14T10:30:00Z', expected: true, description: 'Valid ISO format' },
  { input: 'Thu Jan 01 04:00:00 GMT+04:00 1970', expected: true, description: 'Valid toString format' },
  { input: '12/14/2025', expected: true, description: 'Valid US date format' },
  
  // Invalid Date object
  { input: new Date('invalid'), expected: false, description: 'Invalid Date object' },
  
  // Invalid date values
  { input: '2025-99-99', expected: false, description: 'Invalid date values (month/day)' },
  { input: '2025-12-14garbage', expected: false, description: 'Date with extra characters' },
  { input: 'not-a-date', expected: false, description: 'Random string' },
  
  // Null/undefined
  { input: null, expected: false, description: 'Null value' },
  { input: undefined, expected: false, description: 'Undefined value' },
  
  // Empty/whitespace strings
  { input: '', expected: false, description: 'Empty string' },
  { input: ' ', expected: false, description: 'Single space' },
  { input: '   ', expected: false, description: 'Multiple spaces' },
  { input: '\t', expected: false, description: 'Tab character' },
  { input: '\n', expected: false, description: 'Newline character' },
  { input: ' \t\n ', expected: false, description: 'Mixed whitespace' },
  
  // Wrong type
  { input: 123, expected: false, description: 'Number type' },
  { input: {}, expected: false, description: 'Plain object' },
  { input: [], expected: false, description: 'Array' }
];

function runTestingValidateDateTime() {
  Logger.log('=== Running DateTime Validation Tests ===\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  testArrayDateTime.forEach((test, index) => {
    const result = isValidDateTime(test.input);
    const actualStatus = result.status;
    const testPassed = actualStatus === test.expected;
    
    if (testPassed) {
      passed++;
      Logger.log(`✓ Test ${index + 1}: ${test.description} - PASSED`);
    } else {
      failed++;
      Logger.log(`✗ Test ${index + 1}: ${test.description} - FAILED`);
      Logger.log(`  Expected: ${test.expected}, Got: ${actualStatus}`);
      Logger.log(`  Message: ${result.message}`);
      failures.push({
        test: index + 1,
        description: test.description,
        input: test.input,
        expected: test.expected,
        actual: actualStatus,
        message: result.message
      });
    }
  });
  
  Logger.log(`\n=== Test Summary ===`);
  Logger.log(`Total: ${testArrayDateTime.length}`);
  Logger.log(`Passed: ${passed}`);
  Logger.log(`Failed: ${failed}`);
  
  if (failures.length > 0) {
    Logger.log(`\n=== Failed Tests Details ===`);
    failures.forEach(f => {
      Logger.log(`Test ${f.test}: ${f.description}`);
      Logger.log(`  Input: ${JSON.stringify(f.input)}`);
      Logger.log(`  Expected: ${f.expected}, Got: ${f.actual}`);
      Logger.log(`  Message: ${f.message}\n`);
    });
  }
  
  return { passed, failed, total: testArrayDateTime.length, failures };
}