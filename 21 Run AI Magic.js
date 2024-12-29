function runAiMagic(e) {
  const promptId = e.parameters.promptId;
  const messageId = e.parameters.messageId;

  const payload = {
    message_ids: [messageId],
    prompt_id: promptId
  };
  const result = makeCarbonVoiceRequest('POST', '/responses', payload, null);
  if (result.hasAccess === false) {
    return buildAuthorizationCard(result.authUrl);
  }

  const card = openOneVoiceMemoCard(e);
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(card)
    )
    .setStateChanged(true)
    .build();
}
