// Generated by CoffeeScript 2.5.1
(function() {
  // Контекстное меню
  var contexts, id, onContextClick;

  onContextClick = function(info, tab) {
    return chrome.tabs.query({
      'active': true,
      'currentWindow': true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        'functiontoInvoke': 'activate'
      });
    });
  };

  contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];

  id = chrome.contextMenus.create({
    'title': "Market markup",
    'contexts': contexts,
    'onclick': onContextClick
  });

}).call(this);
