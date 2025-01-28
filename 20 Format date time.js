function formatDateTime(userTimeZone, dateString) {
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