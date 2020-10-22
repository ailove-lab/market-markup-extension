# Контекстное меню
onContextClick = (info, tab) ->
  chrome.tabs.query { 'active': true, 'currentWindow': true }, (tabs) ->
    chrome.tabs.sendMessage tabs[0].id, 'functiontoInvoke': 'activate'

contexts = [ 'page','selection','link','editable','image','video','audio' ]
id = chrome.contextMenus.create
    'title': "Market markup"
    'contexts': contexts
    'onclick': onContextClick 
