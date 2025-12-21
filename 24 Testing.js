const testFolders = ['Folder 1', 'Folder 2', 'Folder 3', 'Folder 4', 'Folder 5', 'Folder 6', 'Folder 7'];
const testMessageIds = ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5', 'Message 6', 'Message 7'];

const testArray = [
  { maxItemsPerCard: 2, pageNumber: 0, expectedFolders: ['Folder 1', 'Folder 2'], expectedMessageIds: [], showNext: true, showPrevious: false },
  { maxItemsPerCard: 2, pageNumber: 3, expectedFolders: ['Folder 7'], expectedMessageIds: ['Message 1'], showNext: true, showPrevious: true },
  { maxItemsPerCard: 3, pageNumber: 0, expectedFolders: ['Folder 1', 'Folder 2', 'Folder 3'], expectedMessageIds: [], showNext: true, showPrevious: false },
  { maxItemsPerCard: 3, pageNumber: 2, expectedFolders: ['Folder 7'], expectedMessageIds: ['Message 1', 'Message 2'], showNext: true, showPrevious: true },
  { maxItemsPerCard: 7, pageNumber: 0, expectedFolders: ['Folder 1', 'Folder 2', 'Folder 3', 'Folder 4', 'Folder 5', 'Folder 6', 'Folder 7'], expectedMessageIds: [], showNext: true, showPrevious: false },
  { maxItemsPerCard: 7, pageNumber: 1, expectedFolders: [], expectedMessageIds: ['Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5', 'Message 6', 'Message 7'], showNext: false, showPrevious: true },
  // { maxItemsPerCard: 3, pageNumber: 2, expectedFolders: [], expectedMessageIds: [] },
];


function testDetectVisibleItems() {
  // Helper function to compare arrays
  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  };
  let errStr = '';
  testArray.forEach((testCase, index) => {
    const result = detectVisibleItems('root', testCase.pageNumber, testCase.maxItemsPerCard, testFolders, testMessageIds);

    // Helper function to compare arrays
    const arraysAreEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item, index) => item === arr2[index]);
    };

    const foldersMatch = arraysAreEqual(result.visibleFolders, testCase.expectedFolders);
    const messageIdsMatch = arraysAreEqual(result.visibleMessageIds, testCase.expectedMessageIds);

    const showNextMatch = result.showNext === testCase.showNext;
    const showPreviousMatch = result.showPrevious === testCase.showPrevious;

    if (foldersMatch && messageIdsMatch && showNextMatch && showPreviousMatch) {
      console.log(`Test case ${index + 1}: PASS`);
      console.log('Expected folders:', testCase.expectedFolders);
      console.log('Actual folders:', result.visibleFolders);
      console.log('Expected messages:', testCase.expectedMessageIds);
      console.log('Actual messages:', result.visibleMessageIds);
      console.log('Expected Show Next:', testCase.showNext);
      console.log('Actual Show Next:', result.showNext);
      console.log('Expected Show Previous:', testCase.showPrevious);
      console.log('Actual Show Previous:', result.showPrevious);
    } else {
      const errors = `
      Test case ${index + 1}: FAIL
      Expected folders: ${testCase.expectedFolders}
      Actual folders: ${result.visibleFolders}
      Expected messages: ${testCase.expectedMessageIds}
      Actual messages: ${result.visibleMessageIds}
      Expected Show Next: ${testCase.showNext}
      Actual Show Next: ${result.showNext}
      Expected Show Previous: ${testCase.showPrevious}
      Actual Show Previous: ${result.showPrevious}
      `;
      console.error(errors);
      errStr += errors + `
      ------------------------`;
    }
    console.log('-------------------');
  });
  if (errStr.length > 0) {
    console.error(errStr);
  }
}

function detectVisibleItems(folderId, pageNumber, maxItemsPerCard, folders, messageIds) {
  const startIndex = pageNumber * maxItemsPerCard;
  const totalItems = folders.length + messageIds.length;
  let visibleFolders = [];
  let visibleMessageIds = [];

  // If we're still within folders range
  if (startIndex < folders.length) {
    const remainingFolders = folders.length - startIndex;
    const foldersToShow = Math.min(remainingFolders, maxItemsPerCard);
    visibleFolders = folders.slice(startIndex, startIndex + foldersToShow);
  }

  // Calculate how many message slots we have available
  const remainingSlots = maxItemsPerCard - visibleFolders.length;

  // If we have remaining slots and we've shown enough folders
  if (remainingSlots > 0) {
    const messageStartIndex = Math.max(0, startIndex - folders.length);
    visibleMessageIds = messageIds.slice(messageStartIndex, messageStartIndex + remainingSlots);
  }

  // Calculate pagination controls
  const showPrevious = startIndex > 0;

  // Calculate if there are more items ahead
  const currentEndIndex = startIndex + maxItemsPerCard;
  const showNext = currentEndIndex < totalItems;

  return {
    visibleFolders,
    visibleMessageIds,
    showPrevious,
    showNext
  };
}

function detectVisibleItems2(folderId, pageNumber, maxItemsPerCard, folders, messageIds) {

  const visibleFolders = [];
  const visibleMessageIds = [];
  return { visibleFolders, visibleMessageIds };
}