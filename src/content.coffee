selectors =
  title:
    name: "Заголовок"
    color: "magenta"
  image:
    name: "Изображение"
    color: "#DF0000"
  price:
    name: "Цена"
    color: "#00BF00"
  descr:
    name: "Описание"
    color: "#0000BF"
  #sku:
  #  name: "Артикул"
  #  color: "#FF00BF"

currentSelector = undefined

# Создет маркеры выделения
createSelectors = ->
  i = 0
  for k, v of selectors
    v.el = document.createElement "div"
    name = document.createElement "span"
    name.textContent = "\u00a0#{i+1})\u00a0#{v.name}\u00a0"
    name.style.cssText = """
      background: white;
      padding:4px;
      border-radius: 3px;
      """
    v.el.appendChild name
    document.body.appendChild v.el
    v.id = i 
    resetSelector v      
    i+=1

# Удаляет маркеры из верстки
deleteSelectors = ->
  for k, v of selectors
    v.el.remove()

# Создание справки и кнопок управления
menu = undefined
createMenu = ->
  menu = document.createElement('div')
  menu.style.cssText = """
    position: fixed ; 
    top:5px; right: 5px;
    padding: 8px;
    border-radius: 10px;
    background: rgba(0,0,0,0.5); 
    filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
    color:white;
    z-index:1000000000;"""
  menu.innerHTML = "Используйте клавиши 1, 2, 3, 4 для выбора типа элемента</br></br>"

  createButton = (text, handler)->
    btn = document.createElement('span')
    btn.innerText = text
    btn.style.cssText = """
      background:white; 
      color: black; 
      margin:4px; 
      padding:2px 8px 2px 8px;
      cursor: pointer;
      border-radius: 5px;"""
    btn.addEventListener "click", handler
    menu.appendChild btn
    btn

  save = createButton "Save", ->
    saveMarkup()
    deactivate()
  cancel = createButton "Cancel", deactivate
  
  document.body.appendChild menu

# Удалеяет справку из верстки
removeMenu = ->
  menu.remove()

# Сбрасывает настройки визуального выделения 
resetSelector = (v)->
  v.el.style.cssText = """
    position:absolute;
    pointer-events: none;
    overflow: hidden;
    padding-left: 2px;
    padding-top: 6px;
    font-weight: bold;
    color: #{v.color};
    width: 96px;
    height:32px;
    top: #{32+48*v.id}px;
    left: 32px;
    border: 2px solid #{v.color};
    border-radius: 5px;
    opacity:1.0; 
    z-index:1000000000;
    background: rgba(128,128,128,0.1);
    filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.75));
    font-family: Arial;
    font-size: 12px;
    transition: all 300ms ease;
    """
  v.element = undefined

# Извлекает CSS элемента для отчета
getElementCss = (el)->
  css = window.getComputedStyle el
  styles = "fontSize fontVariant fontWeight width height lineHeight inlineSize background color fill display".split ' '
  result = {}
  styles.map (s)-> result[s] = css[s]
  result

# Извлекате CSS путь до элемента
getCssSelector = (el) ->
  if !(el instanceof Element)
    return
  path = []
  while el.nodeType == Node.ELEMENT_NODE
    selector = el.nodeName.toLowerCase()
    if el.id
      selector += '#' + el.id
    else
      sib = el
      nth = 1
      while sib.nodeType == Node.ELEMENT_NODE and (sib = sib.previousSibling) and nth++
        selector += ':nth-child(' + nth + ')'
    path.unshift selector
    el = el.parentNode
  path.join ' > '

getElement = (el)->
  b = el.getBoundingClientRect()

  # url: window.location.href
  category: currentSelector
  xpath: getXpath el
  selector: getCssSelector el
  css: getElementCss el
  html: el.outerHTML
  text: el.innerText
  bbox:
    left:   b.left+window.scrollX
    top:  b.top+window.scrollY
    width:  b.width
    height: b.height
  window:
    width:  window.innerWidth
    height: window.innerHeight


onclick = (e)->

  # Пропускаем события из меню
  return true if e.target.parentNode is menu

  # Все остальные блочим
  if e.ctrlKey
    e.target.style.visibility = 'hidden'
    return false
  else
    e.stopPropagation()
    e.preventDefault()
    return false unless currentSelector?

    selectors[currentSelector].element = getElement e.target
    currentSelector = undefined
    if images_masked then unmaskImages()
    return false


onrightclick = (e)->
  console.log "RIGHT"
  console.log e.pageX, e.pageY
  for k, v of selectors
    bbox = selectors[k].element?.bbox
    if bbox? and (
      e.pageX >= bbox.left and 
      e.pageY >= bbox.top and 
      e.pageX <= bbox.left+bbox.width and
      e.pageY <= bbox.top+bbox.height)
      resetSelector v

  e.stopPropagation()
  e.preventDefault()

  currentSelector = undefined
  if images_masked then unmaskImages()

  return false

onkeypress = (e)->
  e.stopPropagation()
  e.preventDefault()
  console.log e.key
  switch e.key
    when '1' then currentSelector = "title"
    when '2'
      currentSelector = "image"
      maskImages()
    when '3' then currentSelector = "price"
    when '4' then currentSelector = "descr"
    # when '5' then currentSelector = "sku"
    # when ' ' then saveMarkup()
    when 'Escape' then deactivate()
  
  if e.key != '2' and images_masked
    unmaskImages()

  # pup_key e.key
  return false

# Отправка разметки на сервер
saveMarkup = ->
  json = {key: window.location.href, value:{}}
  for k, v of selectors
    json.value[k] = selectors[k].element
  json = JSON.stringify json
  res = await fetch "https://vs43.ailove.ru:8800/markup_extension/#{encodeURIComponent(window.location.href)}",
    method: 'POST'              #  *GET, POST, PUT, DELETE, etc.
    mode: 'cors'                #  no-cors, cors, *same-origin
    cache: 'no-cache'           #  *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin'  #  include, *same-origin, omit
    headers: 
      'Content-Type': 'application/json'
    redirect: 'follow'          #  manual, *follow, error
    referrer: 'no-referrer'     #  no-referrer, *client
    body: json
  # document.location.reload(true)

# Получение xpath до элемента
getXpath = (elt) ->
  path = ''
  while elt and elt.nodeType == 1
    idx = getIndex(elt)
    xname = elt.tagName.toLowerCase()
    if idx > 1
      xname += '[' + idx + ']'
    path = '/' + xname + path
    elt = elt.parentNode
  path

# Получение позиции элемента в родителе
getIndex = (elt) ->
  count = 1
  sib = elt.previousSibling
  while sib
    if sib.nodeType == 1 and sib.tagName == elt.tagName
      count++
    sib = sib.previousSibling
  count

# Оснновной перехватчик курсора, подсвечивает элемент
onmouseover = (event) ->
  el = event.target
  return if el is menu or el.parentNode is menu
  strokeEl el 

# stroke = document.createElement('div')
# stroke.style.cssText = 'position:absolute; background: #000; opacity:0.5; z-index:1000000000;'
# document.body.appendChild stroke

# if document.body.addEventListener
#   document.body.addEventListener 'mouseover', onmouseover, false
# else if document.body.attachEvent
#   document.body.attachEvent 'mouseover', (e) ->
#     onmouseover e or window.event
# else
#   document.body.onmouseover = handler

bindEvents = ->
  console.log "BIND"
  document.addEventListener "click"      , onclick     , true
  document.addEventListener "contextmenu", onrightclick, true
  document.addEventListener "keydown"    , onkeypress  , true

  document.body.addEventListener 'mouseover', onmouseover, false

unbindEvents = ->
  document.removeEventListener "click"      , onclick     
  document.removeEventListener "contextmenu", onrightclick
  document.removeEventListener "keydown"    , onkeypress
  
  document.body.removeEventListener 'mouseover', onmouseover

strokeEl = (el) ->
  return unless currentSelector?
  offset = 2
  bbox = el.getBoundingClientRect()
  s = selectors[currentSelector]
  s.el.style.width  = "#{bbox.width+offset*2}px"
  s.el.style.height = "#{bbox.height+offset*2}px"
  s.el.style.top    = "#{window.scrollY + bbox.top-offset}px"
  s.el.style.left   = "#{window.scrollX + bbox.left-offset}px"
  s.element = getElement el

currentSelector = undefined

images_style = undefined
images_masked = false
maskImages = ->
  images_style = document.createElement "style"
  images_style.appendChild document.createTextNode("")
  document.head.appendChild images_style
  images_style.sheet.insertRule("*   { pointer-events: none !important; }", 0)
  images_style.sheet.insertRule("img { pointer-events: auto !important; border: 1px solid red !important; }", 1)
  images_masked = true

unmaskImages = ->
  document.head.removeChild images_style
  images_masked = false

activate = ->
  createMenu()
  createSelectors()
  bindEvents()

deactivate = ->
  unbindEvents()
  removeMenu()
  deleteSelectors()
  
  # на всякий пожарный перегрузим
  document.location.reload()

chrome.extension.onMessage.addListener (message, sender, callback)->
  activate() if message.functiontoInvoke == "activate"
   
