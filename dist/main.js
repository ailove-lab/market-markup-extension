// Generated by CoffeeScript 2.5.1
var create_selectors, current_selector, get_css_selector, get_element, get_element_css, get_index, get_xpath, handler, images_masked, images_style, mask_images, onclick, onkeypress, onrightclick, reset_selector, save_markup, selectors, skip, stroke, stroke_el, unmask_images;

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
//    name: "Артикул"
//    color: "#FF00BF"
current_selector = void 0;

// Создет маркеры выделения
create_selectors = function() {
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
    reset_selector(v);
    results.push(i += 1);
  }
  return results;
};

reset_selector = function(v) {
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

create_selectors();

get_element_css = function(el) {
  var css, result, styles;
  css = window.getComputedStyle(el);
  styles = "fontSize fontVariant fontWeight width height lineHeight inlineSize background color fill display".split(' ');
  result = {};
  styles.map(function(s) {
    return result[s] = css[s];
  });
  return result;
};

get_css_selector = function(el) {
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

get_element = function(el) {
  var b;
  b = el.getBoundingClientRect();
  return {
    // url: window.location.href
    category: current_selector,
    xpath: get_xpath(el),
    selector: get_css_selector(el),
    css: get_element_css(el),
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
  if (e.ctrlKey) {
    e.target.style.visibility = 'hidden';
    return false;
  } else {
    e.stopPropagation();
    e.preventDefault();
    if (current_selector == null) {
      return false;
    }
    selectors[current_selector].element = get_element(e.target);
    current_selector = void 0;
    if (images_masked) {
      unmask_images();
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
      reset_selector(v);
    }
  }
  e.stopPropagation();
  e.preventDefault();
  current_selector = void 0;
  if (images_masked) {
    unmask_images();
  }
  return false;
};

onkeypress = function(e) {
  e.stopPropagation();
  e.preventDefault();
  console.log(e.key);
  switch (e.key) {
    case '1':
      current_selector = "title";
      break;
    case '2':
      current_selector = "image";
      mask_images();
      break;
    case '3':
      current_selector = "price";
      break;
    case '4':
      current_selector = "descr";
      break;
    // when '5' then current_selector = "sku"
    case ' ':
      save_markup();
      break;
    case 'Escape':
      skip();
  }
  if (e.key !== '2' && images_masked) {
    unmask_images();
  }
  // pup_key e.key
  return false;
};

save_markup = function() {
  var json, k, res, v;
  json = {
    key: window.url,
    pid: window.pid,
    queue: window.queue,
    value: {}
  };
  for (k in selectors) {
    v = selectors[k];
    json.value[k] = selectors[k].element;
  }
  json = JSON.stringify(json);
  res = fetch(`/markup/${pid}`, {
    method: 'POST', //  *GET, POST, PUT, DELETE, etc.
    mode: 'cors', //  no-cors, cors, *same-origin
    cache: 'no-cache', //  *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', //  no-referrer, *client
    body: json
  });
  return document.location.reload(true);
};

skip = function() {
  var json, res;
  json = {
    key: window.url,
    pid: window.pid,
    queue: window.queue,
    value: {}
  };
  json = JSON.stringify(json);
  res = fetch(`/skip/${pid}`, {
    method: 'POST', //  *GET, POST, PUT, DELETE, etc.
    mode: 'cors', //  no-cors, cors, *same-origin
    cache: 'no-cache', //  *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', //  no-referrer, *client
    body: json
  });
  return document.location.reload(true);
};

get_xpath = function(elt) {
  var idx, path, xname;
  path = '';
  while (elt && elt.nodeType === 1) {
    idx = get_index(elt);
    xname = elt.tagName.toLowerCase();
    if (idx > 1) {
      xname += '[' + idx + ']';
    }
    path = '/' + xname + path;
    elt = elt.parentNode;
  }
  return path;
};

get_index = function(elt) {
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

stroke_el = function(el) {
  var bbox, offset, s;
  if (current_selector == null) {
    return;
  }
  offset = 2;
  bbox = el.getBoundingClientRect();
  s = selectors[current_selector];
  s.el.style.width = `${bbox.width + offset * 2}px`;
  s.el.style.height = `${bbox.height + offset * 2}px`;
  s.el.style.top = `${window.scrollY + bbox.top - offset}px`;
  s.el.style.left = `${window.scrollX + bbox.left - offset}px`;
  return s.element = get_element(el);
};

handler = function(event) {
  var el;
  el = event.target;
  return stroke_el(el);
};

document.addEventListener("click", onclick, true);

document.addEventListener("contextmenu", onrightclick, true);

document.addEventListener("keydown", onkeypress, true);

stroke = document.createElement('div');

stroke.style.cssText = 'position:absolute; opacity:0.3; z-index:1000000000;';

document.body.appendChild(stroke);

if (document.body.addEventListener) {
  document.body.addEventListener('mouseover', handler, false);
} else if (document.body.attachEvent) {
  document.body.attachEvent('mouseover', function(e) {
    return handler(e || window.event);
  });
} else {
  document.body.onmouseover = handler;
}

// for k, v of data
//     current_selector = k
//     el = document.evaluate(v.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
//     stroke_el el
current_selector = void 0;

images_style = void 0;

images_masked = false;

mask_images = function() {
  console.log("mask images");
  images_style = document.createElement("style");
  images_style.appendChild(document.createTextNode(""));
  document.head.appendChild(images_style);
  images_style.sheet.insertRule("*   { pointer-events: none !important; }", 0);
  images_style.sheet.insertRule("img { pointer-events: auto !important; border: 1px solid red !important; }", 1);
  return images_masked = true;
};

unmask_images = function() {
  console.log("unmask images");
  document.head.removeChild(images_style);
  return images_masked = false;
};

// console.log "Sheet"
// sheet = new CSSStyleSheet()
// sheet.replaceSync 'img { border: 1px solid red !important; }'
// document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]