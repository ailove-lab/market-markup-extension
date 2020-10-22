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
    #    name: "Артикул"
    #    color: "#FF00BF"

current_selector = undefined

# Создет маркеры выделения
create_selectors=->
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
        reset_selector v            
        i+=1

reset_selector = (v)->
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

create_selectors()

get_element_css = (el)->
    css = window.getComputedStyle el
    styles = "fontSize fontVariant fontWeight width height lineHeight inlineSize background color fill display".split ' '
    result = {}
    styles.map (s)-> result[s] = css[s]
    result

get_css_selector = (el) ->
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

get_element = (el)->
    b = el.getBoundingClientRect()

    # url: window.location.href
    category: current_selector
    xpath: get_xpath el
    selector: get_css_selector el
    css: get_element_css el
    html: el.outerHTML
    text: el.innerText
    bbox:
        left:   b.left+window.scrollX
        top:    b.top+window.scrollY
        width:  b.width
        height: b.height
    window:
        width:  window.innerWidth
        height: window.innerHeight


onclick = (e)->

    if e.ctrlKey
        e.target.style.visibility = 'hidden'
        return false
    else
        e.stopPropagation()
        e.preventDefault()
        return false unless current_selector?

        selectors[current_selector].element = get_element e.target
        current_selector = undefined
        if images_masked then unmask_images()
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
            reset_selector v

    e.stopPropagation()
    e.preventDefault()

    current_selector = undefined
    if images_masked then unmask_images()

    return false

onkeypress = (e)->
    e.stopPropagation()
    e.preventDefault()
    console.log e.key
    switch e.key
        when '1' then current_selector = "title"
        when '2'
            current_selector = "image"
            mask_images()
        when '3' then current_selector = "price"
        when '4' then current_selector = "descr"
        # when '5' then current_selector = "sku"
        when ' ' then save_markup()
        when 'Escape' then skip()
    
    if e.key != '2' and images_masked
        unmask_images()

    # pup_key e.key
    return false
    
save_markup = ->
    json = {key: window.url, pid: window.pid, queue: window.queue, value:{}}
    for k, v of selectors
        json.value[k] = selectors[k].element
    json = JSON.stringify json
    res = fetch "/markup/#{pid}",
        method: 'POST'              #  *GET, POST, PUT, DELETE, etc.
        mode: 'cors'                #  no-cors, cors, *same-origin
        cache: 'no-cache'           #  *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin'  # include, *same-origin, omit
        headers: 
            'Content-Type': 'application/json'
        redirect: 'follow'          # manual, *follow, error
        referrer: 'no-referrer'     #  no-referrer, *client
        body: json
    document.location.reload(true)

skip = ->
    json = {key: window.url, pid: window.pid, queue: window.queue, value:{}}
    json = JSON.stringify json
    res = fetch "/skip/#{pid}",
        method: 'POST'              #  *GET, POST, PUT, DELETE, etc.
        mode: 'cors'                #  no-cors, cors, *same-origin
        cache: 'no-cache'           #  *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin'  # include, *same-origin, omit
        headers: 
            'Content-Type': 'application/json'
        redirect: 'follow'          # manual, *follow, error
        referrer: 'no-referrer'     #  no-referrer, *client
        body: json
    document.location.reload(true)

get_xpath = (elt) ->
    path = ''
    while elt and elt.nodeType == 1
        idx = get_index(elt)
        xname = elt.tagName.toLowerCase()
        if idx > 1
            xname += '[' + idx + ']'
        path = '/' + xname + path
        elt = elt.parentNode
    path

get_index = (elt) ->
    count = 1
    sib = elt.previousSibling
    while sib
        if sib.nodeType == 1 and sib.tagName == elt.tagName
            count++
        sib = sib.previousSibling
    count


stroke_el = (el) ->
    return unless current_selector?
    offset = 2
    bbox = el.getBoundingClientRect()
    s = selectors[current_selector]
    s.el.style.width  = "#{bbox.width+offset*2}px"
    s.el.style.height = "#{bbox.height+offset*2}px"
    s.el.style.top    = "#{window.scrollY + bbox.top-offset}px"
    s.el.style.left   = "#{window.scrollX + bbox.left-offset}px"
    s.element = get_element el

handler = (event) ->
    el = event.target
    stroke_el el 


document.addEventListener "click"      , onclick, true
document.addEventListener "contextmenu", onrightclick, true
document.addEventListener "keydown"    , onkeypress, true

stroke = document.createElement('div')
stroke.style.cssText = 'position:absolute; opacity:0.3; z-index:1000000000;'

document.body.appendChild stroke
if document.body.addEventListener
    document.body.addEventListener 'mouseover', handler, false
else if document.body.attachEvent
    document.body.attachEvent 'mouseover', (e) ->
        handler e or window.event
else
    document.body.onmouseover = handler

# for k, v of data
#     current_selector = k
#     el = document.evaluate(v.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
#     stroke_el el

current_selector = undefined


images_style = undefined
images_masked = false
mask_images = ->
    console.log "mask images"
    images_style = document.createElement "style"
    images_style.appendChild document.createTextNode("")
    document.head.appendChild images_style
    images_style.sheet.insertRule("*   { pointer-events: none !important; }", 0)
    images_style.sheet.insertRule("img { pointer-events: auto !important; border: 1px solid red !important; }", 1)
    images_masked = true
unmask_images = ->
    console.log "unmask images"
    document.head.removeChild images_style
    images_masked = false

# console.log "Sheet"
# sheet = new CSSStyleSheet()
# sheet.replaceSync 'img { border: 1px solid red !important; }'
# document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]

