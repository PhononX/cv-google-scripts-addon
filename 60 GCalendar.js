function onHomepageCalendar(e) {
  // return createEventCard(e);
  return createNoEventSelectedCard();
}

// Handle calendar event selection
function onCalendarEventOpen(e) {
  return createEventCard(e);
}

// Create the card with event details
function createEventCard(e) {
  // Get the calendar event
  let calendarEvent = null;

  // try {

    const emails = [];

    if (e && e.calendar && e.calendar.id) {
      const calendar = CalendarApp.getCalendarById(e.calendar.calendarId);
      calendarEvent = calendar.getEventById(e.calendar.id);
    } else {
      return createNoEventSelectedCard();
    }

    if (!calendarEvent) {
      return createNoEventSelectedCard();
    }

    const userTimeZone = getTimeZoneValue(e);
    const formattedStartDate = Utilities.formatDate(calendarEvent.getStartTime(), userTimeZone, "MMMM d, yyyy, 'at' hh:mm a");
    const formattedEndDate = Utilities.formatDate(calendarEvent.getEndTime(), userTimeZone, "MMMM d, yyyy, 'at' hh:mm a");
    const eventDescription = 'Start: ' + formattedStartDate + '\nEnd: ' + formattedEndDate + '\nTime zone: ' + userTimeZone;

    const creators = calendarEvent.getCreators();
    if (creators && creators.length > 0) {
      emails.push(creators[0]);
    }

    // Get and add attendees
    const guests = calendarEvent.getGuestList();
    if (guests && guests.length > 0) {
      guests.forEach(guest => {
        emails.push(guest.getEmail());
      });
    }

    const conversationTitleValue = calendarEvent.getTitle();
    const whenToTalk = null;

    return asyncMeetingCard(conversationTitleValue, eventDescription, emails, emails, whenToTalk);
  // } catch (error) {
  //   console.error('Error getting calendar event:', error);
  //   return createInfoCard(error);
  // }
}

// Create a card when no event is selected
function createNoEventSelectedCard() {
  return CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('● If you want to create a new async meeting, select a calendar event.')))
    .build();
}


function updateCalendarEvent(channelUrl, calendarId, eventId) {
  const br = `
`;
  // const calendar = CalendarApp.getCalendarById(calendarId);

  // Get the existing event
  const event = Calendar.Events.get(calendarId, eventId);

  const currentDescription = event.description;
  const updatedDescription = currentDescription == null ? '' : currentDescription + br;

  event.description = updatedDescription + 'To get the conversation started ahead of the meeting, setup this async meeting: ' + channelUrl;

  // Update the event with notification control
  Calendar.Events.update(event, calendarId, eventId, {
    sendUpdates: 'none' // 'all', 'externalOnly', or 'none'
  });
}