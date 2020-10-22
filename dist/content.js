// Generated by CoffeeScript 2.5.1
(function() {
  var activate, bindEvents, createMenu, createSelectors, currentSelector, deactivate, deleteSelectors, getCssSelector, getElement, getElementCss, getIndex, getXpath, images_masked, images_style, maskImages, menu, onclick, onkeypress, onmouseover, onrightclick, removeMenu, resetSelector, saveMarkup, selectors, strokeEl, unbindEvents, unmaskImages;

  selectors = {
    title: {
      name: "Заголовок",
      color: "magenta"
    },
    image: {
      name: "Изображение",
      color: "#DF0000"
    },
    price: {
      name: "Цена",
      color: "#00BF00"
    },
    descr: {
      name: "Описание",
      color: "#0000BF"
    }
  };

  //sku:
  //  name: "Артикул"
  //  color: "#FF00BF"
  currentSelector = void 0;

  // Создет маркеры выделения
  createSelectors = function() {
    var i, k, name, results, v;
    i = 0;
    results = [];
    for (k in selectors) {
      v = selectors[k];
      v.el = document.createElement("div");
      name = document.createElement("span");
      name.textContent = `\u00a0${i + 1})\u00a0${v.name}\u00a0`;
      name.style.cssText = `background: white;
padding:4px;
border-radius: 3px;`;
      v.el.appendChild(name);
      document.body.appendChild(v.el);
      v.id = i;
      resetSelector(v);
      results.push(i += 1);
    }
    return results;
  };

  // Удаляет маркеры из верстки
  deleteSelectors = function() {
    var k, results, v;
    results = [];
    for (k in selectors) {
      v = selectors[k];
      results.push(v.el.remove());
    }
    return results;
  };

  // Создание справки и кнопок управления
  menu = void 0;

  createMenu = function() {
    var cancel, createButton, save;
    menu = document.createElement('div');
    menu.style.cssText = `position: fixed ; 
top:5px; right: 5px;
padding: 8px;
border-radius: 10px;
background: rgba(0,0,0,0.5); 
filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
color:white;
z-index:1000000000;`;
    menu.innerHTML = "Используйте клавиши 1, 2, 3, 4 для выбора типа элемента</br></br>";
    createButton = function(text, handler) {
      var btn;
      btn = document.createElement('span');
      btn.innerText = text;
      btn.style.cssText = `background:white; 
color: black; 
margin:4px; 
padding:2px 8px 2px 8px;
cursor: pointer;
border-radius: 5px;`;
      btn.addEventListener("click", handler);
      menu.appendChild(btn);
      return btn;
    };
    save = createButton("Save", function() {
      saveMarkup();
      return deactivate();
    });
    cancel = createButton("Cancel", deactivate);
    return document.body.appendChild(menu);
  };

  // Удалеяет справку из верстки
  removeMenu = function() {
    return menu.remove();
  };

  // Сбрасывает настройки визуального выделения 
  resetSelector = function(v) {
    v.el.style.cssText = `position:absolute;
pointer-events: none;
overflow: hidden;
padding-left: 2px;
padding-top: 6px;
font-weight: bold;
color: ${v.color};
width: 96px;
height:32px;
top: ${32 + 48 * v.id}px;
left: 32px;
border: 2px solid ${v.color};
border-radius: 5px;
opacity:1.0; 
z-index:1000000000;
background: rgba(128,128,128,0.1);
filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.75));
font-family: Arial;
font-size: 12px;
transition: all 300ms ease;`;
    return v.element = void 0;
  };

  // Извлекает CSS элемента для отчета
  getElementCss = function(el) {
    var css, result, styles;
    css = window.getComputedStyle(el);
    styles = "fontSize fontVariant fontWeight width height lineHeight inlineSize background color fill display".split(' ');
    result = {};
    styles.map(function(s) {
      return result[s] = css[s];
    });
    return result;
  };

  // Извлекате CSS путь до элемента
  getCssSelector = function(el) {
    var nth, path, selector, sib;
    if (!(el instanceof Element)) {
      return;
    }
    path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
      } else {
        sib = el;
        nth = 1;
        while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++) {
          selector += ':nth-child(' + nth + ')';
        }
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  };

  getElement = function(el) {
    var b;
    b = el.getBoundingClientRect();
    return {
      // url: window.location.href
      category: currentSelector,
      xpath: getXpath(el),
      selector: getCssSelector(el),
      css: getElementCss(el),
      html: el.outerHTML,
      text: el.innerText,
      bbox: {
        left: b.left + window.scrollX,
        top: b.top + window.scrollY,
        width: b.width,
        height: b.height
      },
      window: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  };

  onclick = function(e) {
    if (e.target.parentNode === menu) {
      // Пропускаем события из меню
      return true;
    }
    // Все остальные блочим
    if (e.ctrlKey) {
      e.target.style.visibility = 'hidden';
      return false;
    } else {
      e.stopPropagation();
      e.preventDefault();
      if (currentSelector == null) {
        return false;
      }
      selectors[currentSelector].element = getElement(e.target);
      currentSelector = void 0;
      if (images_masked) {
        unmaskImages();
      }
      return false;
    }
  };

  onrightclick = function(e) {
    var bbox, k, ref, v;
    console.log("RIGHT");
    console.log(e.pageX, e.pageY);
    for (k in selectors) {
      v = selectors[k];
      bbox = (ref = selectors[k].element) != null ? ref.bbox : void 0;
      if ((bbox != null) && (e.pageX >= bbox.left && e.pageY >= bbox.top && e.pageX <= bbox.left + bbox.width && e.pageY <= bbox.top + bbox.height)) {
        resetSelector(v);
      }
    }
    e.stopPropagation();
    e.preventDefault();
    currentSelector = void 0;
    if (images_masked) {
      unmaskImages();
    }
    return false;
  };

  onkeypress = function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e.key);
    switch (e.key) {
      case '1':
        currentSelector = "title";
        break;
      case '2':
        currentSelector = "image";
        maskImages();
        break;
      case '3':
        currentSelector = "price";
        break;
      case '4':
        currentSelector = "descr";
        break;
      // when '5' then currentSelector = "sku"
      // when ' ' then saveMarkup()
      case 'Escape':
        deactivate();
    }
    if (e.key !== '2' && images_masked) {
      unmaskImages();
    }
    // pup_key e.key
    return false;
  };

  // Отправка разметки на сервер
  saveMarkup = async function() {
    var json, k, res, v;
    json = {
      key: window.location.href,
      value: {}
    };
    for (k in selectors) {
      v = selectors[k];
      json.value[k] = selectors[k].element;
    }
    json = JSON.stringify(json);
    return res = (await fetch(`https://vs43.ailove.ru:8800/markup_extension/${encodeURIComponent(window.location.href)}`, {
      method: 'POST', //  *GET, POST, PUT, DELETE, etc.
      mode: 'cors', //  no-cors, cors, *same-origin
      cache: 'no-cache', //  *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', //  include, *same-origin, omit
      headers: {
        'Content-Type': 'applicati on/json'
      },
      redirect: 'follow', //  manual, *follow, error
      referrer: 'no-referrer', //  no-referrer, *client
      body: json
    }));
  };

  // document.location.reload(true)

  // Получение xpath до элемента
  getXpath = function(elt) {
    var idx, path, xname;
    path = '';
    while (elt && elt.nodeType === 1) {
      idx = getIndex(elt);
      xname = elt.tagName.toLowerCase();
      if (idx > 1) {
        xname += '[' + idx + ']';
      }
      path = '/' + xname + path;
      elt = elt.parentNode;
    }
    return path;
  };

  // Получение позиции элемента в родителе
  getIndex = function(elt) {
    var count, sib;
    count = 1;
    sib = elt.previousSibling;
    while (sib) {
      if (sib.nodeType === 1 && sib.tagName === elt.tagName) {
        count++;
      }
      sib = sib.previousSibling;
    }
    return count;
  };

  // Оснновной перехватчик курсора, подсвечивает элемент
  onmouseover = function(event) {
    var el;
    el = event.target;
    if (el === menu || el.parentNode === menu) {
      return;
    }
    return strokeEl(el);
  };

  
  // stroke = document.createElement('div')
  // stroke.style.cssText = 'position:absolute; background: #000; opacity:0.5; z-index:1000000000;'
  // document.body.appendChild stroke

  // if document.body.addEventListener
  //   document.body.addEventListener 'mouseover', onmouseover, false
  // else if document.body.attachEvent
  //   document.body.attachEvent 'mouseover', (e) ->
  //     onmouseover e or window.event
  // else
  //   document.body.onmouseover = handler
  bindEvents = function() {
    console.log("BIND");
    document.addEventListener("click", onclick, true);
    document.addEventListener("contextmenu", onrightclick, true);
    document.addEventListener("keydown", onkeypress, true);
    return document.body.addEventListener('mouseover', onmouseover, false);
  };

  unbindEvents = function() {
    document.removeEventListener("click", onclick);
    document.removeEventListener("contextmenu", onrightclick);
    document.removeEventListener("keydown", onkeypress);
    return document.body.removeEventListener('mouseover', onmouseover);
  };

  strokeEl = function(el) {
    var bbox, offset, s;
    if (currentSelector == null) {
      return;
    }
    offset = 2;
    bbox = el.getBoundingClientRect();
    s = selectors[currentSelector];
    s.el.style.width = `${bbox.width + offset * 2}px`;
    s.el.style.height = `${bbox.height + offset * 2}px`;
    s.el.style.top = `${window.scrollY + bbox.top - offset}px`;
    s.el.style.left = `${window.scrollX + bbox.left - offset}px`;
    return s.element = getElement(el);
  };

  currentSelector = void 0;

  images_style = void 0;

  images_masked = false;

  maskImages = function() {
    images_style = document.createElement("style");
    images_style.appendChild(document.createTextNode(""));
    document.head.appendChild(images_style);
    images_style.sheet.insertRule("*   { pointer-events: none !important; }", 0);
    images_style.sheet.insertRule("img { pointer-events: auto !important; border: 1px solid red !important; }", 1);
    return images_masked = true;
  };

  unmaskImages = function() {
    document.head.removeChild(images_style);
    return images_masked = false;
  };

  activate = function() {
    createMenu();
    createSelectors();
    return bindEvents();
  };

  deactivate = function() {
    unbindEvents();
    removeMenu();
    deleteSelectors();
    
    // на всякий пожарный перегрузим
    return document.location.reload();
  };

  chrome.extension.onMessage.addListener(function(message, sender, callback) {
    if (message.functiontoInvoke === "activate") {
      return activate();
    }
  });

}).call(this);
