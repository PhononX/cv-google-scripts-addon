
function getPrompts() {
  const result = makeCarbonVoiceRequest('GET', '/prompts', null, null);
  if (!result.hasAccess) {
    return result;
  }
  const allPrompts = [];
  result.json.forEach(el => {
    allPrompts.push({ id: el.id, name: el.name, categoryNumber: el.category_number, orderInCategory: el.order_in_category });
  });

  return { hasAccess: true, allPrompts: allPrompts };
}