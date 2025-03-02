function getPromptsSidebar(){
  const result = getPrompts();
  Logger.log(JSON.stringify(result))
  return JSON.stringify(result);
}

function getPrompts() {
  const result = makeCarbonVoiceRequest('GET', '/prompts', null, null);
  if (!result.hasAccess) {
    return result;
  }
  const allPrompts = [];
  result.json.forEach(el => {
    allPrompts.push({ id: el.id, name: el.name, categoryNumber: el.category_number, orderInCategory: el.order_in_category });
  });
Logger.log(JSON.stringify(allPrompts))
Logger.log(allPrompts.length)
  return { hasAccess: true, allPrompts };
}
