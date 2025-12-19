function getAllUserPropertiesServiceJson(propertyKey) {
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty(propertyKey);
  if (str == null) {
    json = {};
  } else {
    json = JSON.parse(str);
  }
  return json;
}

function userPropertiesServiceJson(propertyKey) {
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty(propertyKey);
  if (str == null) {
    json = {};
  } else {
    json = JSON.parse(str);
  }
  return json;
}

function userPropertiesServiceRecordJson(propertyKey, valueJson) {
  const valueString = JSON.stringify(valueJson);
  const userProperty = PropertiesService.getUserProperties();
  userProperty.setProperty(propertyKey, valueString);
}

function userPropertiesServiceRemoveValue(propertyKey) {
  const userProperty = PropertiesService.getUserProperties();
  userProperty.deleteProperty(propertyKey);
}

function userPropertiesStorageSizeKB(){
  const props = PropertiesService.getUserProperties().getProperties();
  const propsString = JSON.stringify(props);
  const sizeInBytes = Utilities.newBlob(propsString).getBytes().length;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  // Logger.log(`Storage used: ${sizeInKB} KB`);
  return sizeInKB;
}

// Function 1: Get oldest 90 properties sorted by creation date
function getOldestProperties() {
  const userProps = PropertiesService.getUserProperties();
  const allProps = userProps.getProperties();
  
  // Filter out excluded properties and convert to array
  const filteredProps = [];
  for (const [key, value] of Object.entries(allProps)) {
    if (key !== 'oauth2.carbonVoice' && key !== 'carbonVoiceSettings') {
      try {
        const parsed = JSON.parse(value);
        filteredProps.push({
          key: key,
          data: parsed
        });
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
  
  // Sort by ms (oldest first)
  filteredProps.sort((a, b) => a.data.ms - b.data.ms);
  
  // Take up to 90 oldest items and format as requested
  const oldest90 = filteredProps.slice(0, 90).map(item => ({
    [item.key]: item.data
  }));
  
  return oldest90;
}

// Function 2: Create card showing storage warning with removable items
function createStorageWarningCard(e) {
  const oldestProps = getOldestProperties();

  const userTimeZone = getTimeZoneValue(e);

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Storage Almost Full'));
  
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('Your key-value storage in the add-on’s user properties is almost full. Remove the oldest data to free up some space. This action will not affect your async meetings in Carbon Voice.'));
  
  // Create array of keys for removal
  const keysToRemove = [];
  
  // Add each item as a decorated text widget with clickable link
  oldestProps.forEach(item => {
    const key = Object.keys(item)[0];
    const data = item[key];
    
    keysToRemove.push(key);
    
    section.addWidget(CardService.newDecoratedText()
      .setText(`${formatDateTime(userTimeZone, data.ms)}`)
      .setButton(CardService.newTextButton()
        .setText('View')
        .setOpenLink(CardService.newOpenLink()
          .setUrl(`https://carbonvoice.app/c/${data.id}`)
          .setOpenAs(CardService.OpenAs.FULL_SIZE))));
  });
  
  // Add remove button
  section.addWidget(CardService.newButtonSet()
    .addButton(CardService.newTextButton()
      .setText('Remove All Listed Items')
      .setBackgroundColor('#B01F42')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('removeOldestProperties')
        .setParameters({ keys: JSON.stringify(keysToRemove) }))));
  
  card.addSection(section);
  
  return card.build();
}

// Function 3: Remove properties by keys
function removeOldestProperties(e) {
  const keys = JSON.parse(e.parameters.keys);
  const userProps = PropertiesService.getUserProperties();
  
  keys.forEach(key => {
    userProps.deleteProperty(key);
  });
  
  // Return confirmation card
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText(`Successfully removed ${keys.length} items from storage`))
    .setNavigation(CardService.newNavigation()
      .popCard())
    .build();
}