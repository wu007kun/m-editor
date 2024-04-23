class UIElement {
  constructor (dom) {
    this.dom = dom
  }

  add () {
    for (let i = 0; i < arguments.length; i++) {
      const argument = arguments[i]

      if (argument instanceof UIElement) {
        this.dom.appendChild(argument.dom)
      } else {
        console.error('UIElement:', argument, 'is not an instance of UIElement.')
      }
    }

    return this
  }

  remove () {
    for (let i = 0; i < arguments.length; i++) {
      const argument = arguments[i]

      if (argument instanceof UIElement) {
        this.dom.removeChild(argument.dom)
      } else {
        console.error('UIElement:', argument, 'is not an instance of UIElement.')
      }
    }

    return this
  }

  clear () {
    while (this.dom.children.length) {
      this.dom.removeChild(this.dom.lastChild)
    }
  }

  setId (id) {
    this.dom.id = id

    return this
  }

  getId () {
    return this.dom.id
  }

  setClass (name) {
    this.dom.className = name

    return this
  }

  addClass (name) {
    this.dom.classList.add(name)

    return this
  }

  removeClass (name) {
    this.dom.classList.remove(name)

    return this
  }

  setStyle (style, array) {
    for (let i = 0; i < array.length; i++) {
      this.dom.style[style] = array[i]
    }

    return this
  }

  setDisabled (value) {
    this.dom.disabled = value

    return this
  }

  setTextContent (value) {
    this.dom.textContent = value

    return this
  }

  setInnerHTML (value) {
    this.dom.innerHTML = value
  }

  getIndexOfChild (element) {
    return Array.prototype.indexOf.call(this.dom.children, element.dom)
  }
}

// properties

const properties = ['position', 'left', 'top', 'right', 'bottom', 'width', 'height',
  'display', 'verticalAlign', 'overflow', 'color', 'background', 'backgroundColor', 'opacity',
  'border', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor',
  'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom',
  'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
  'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex']

properties.forEach(function (property) {
  const method = 'set' + property.substr(0, 1).toUpperCase() + property.substr(1, property.length)

  UIElement.prototype[method] = function () {
    this.setStyle(property, arguments)

    return this
  }
})

// events

const events = ['KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change', 'Input']

events.forEach(function (event) {
  const method = 'on' + event

  UIElement.prototype[method] = function (callback) {
    this.dom.addEventListener(event.toLowerCase(), callback.bind(this))

    return this
  }
})

class UISpan extends UIElement {
  constructor () {
    super(document.createElement('span'))
  }
}

class UIDiv extends UIElement {
  constructor (className) {
    super(document.createElement('div'))
    this.dom.className = className
  }
}

class UIText extends UISpan {
  constructor (text) {
    super()

    this.dom.className = 'Text'
    this.dom.style.cursor = 'default'
    this.dom.style.display = 'inline-block'

    this.setValue(text)
  }

  getValue () {
    return this.dom.textContent
  }

  setValue (value) {
    if (value !== undefined) {
      this.dom.textContent = value
    }

    return this
  }
}

class UIInput extends UIElement {
  constructor (text) {
    super(document.createElement('input'))
    this.dom.className = 'text-input'
    this.dom.setAttribute('autocomplete', 'off')
    this.dom.addEventListener('keydown', function (event) {
      event.stopPropagation()
    })
    this.setValue(text)
  }

  getValue () {
    return this.dom.value
  }

  setValue (value) {
    this.dom.value = value

    return this
  }
}

class UISelect extends UIElement {
  constructor () {
    super(document.createElement('select'))

    this.dom.className = 'Select'
    this.dom.style.padding = '2px'

    this.dom.setAttribute('autocomplete', 'off')

    this.dom.addEventListener('pointerdown', function (event) {
      event.stopPropagation()
    })
  }

  setMultiple (boolean) {
    this.dom.multiple = boolean

    return this
  }

  setOptions (options) {
    const selected = this.dom.value

    while (this.dom.children.length > 0) {
      this.dom.removeChild(this.dom.firstChild)
    }

    for (const key in options) {
      const option = document.createElement('option')
      option.value = key
      option.innerHTML = options[key]
      this.dom.appendChild(option)
    }

    this.dom.value = selected

    return this
  }

  getValue () {
    return this.dom.value
  }

  setValue (value) {
    value = String(value)

    if (this.dom.value !== value) {
      this.dom.value = value
    }

    return this
  }
}

class UICheckbox extends UIElement {
  constructor (boolean) {
    super(document.createElement('input'))

    this.dom.className = 'Checkbox'
    this.dom.type = 'checkbox'

    this.dom.addEventListener('pointerdown', function (event) {
      // Workaround for TransformControls blocking events in Viewport.Controls checkboxes

      event.stopPropagation()
    })

    this.setValue(boolean)
  }

  getValue () {
    return this.dom.checked
  }

  setValue (value) {
    if (value !== undefined) {
      this.dom.checked = value
    }

    return this
  }
}

class UIColor extends UIElement {
  constructor () {
    super(document.createElement('input'))

    this.dom.className = 'Color'
    this.dom.style.width = '32px'
    this.dom.style.height = '16px'
    this.dom.style.border = '0px'
    this.dom.style.padding = '2px'
    this.dom.style.backgroundColor = 'transparent'

    this.dom.setAttribute('autocomplete', 'off')

    try {
      this.dom.type = 'color'
      this.dom.value = '#ffffff'
    } catch (exception) {}
  }

  getValue () {
    return this.dom.value
  }

  getHexValue () {
    return parseInt(this.dom.value.substr(1), 16)
  }

  setValue (value) {
    this.dom.value = value

    return this
  }

  setHexValue (hex) {
    this.dom.value = '#' + ('000000' + hex.toString(16)).slice(-6)

    return this
  }
}

class UINumber extends UIElement {
  constructor (number) {
    super(document.createElement('input'))

    this.dom.style.cursor = 'ew-resize'
    this.dom.value = '0.00'

    this.dom.setAttribute('autocomplete', 'off')

    this.value = 0

    this.min = -Infinity
    this.max = Infinity

    this.precision = 2
    this.step = 1
    this.unit = ''
    this.nudge = 0.01

    this.setValue(number)

    const scope = this

    const changeEvent = document.createEvent('HTMLEvents')
    changeEvent.initEvent('change', true, true)

    let distance = 0
    let onMouseDownValue = 0

    const pointer = { x: 0, y: 0 }
    const prevPointer = { x: 0, y: 0 }

    function onMouseDown (event) {
      if (document.activeElement === scope.dom) return

      event.preventDefault()

      distance = 0

      onMouseDownValue = scope.value

      prevPointer.x = event.clientX
      prevPointer.y = event.clientY

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    function onMouseMove (event) {
      const currentValue = scope.value

      pointer.x = event.clientX
      pointer.y = event.clientY

      distance += (pointer.x - prevPointer.x) - (pointer.y - prevPointer.y)

      let value = onMouseDownValue + (distance / (event.shiftKey ? 5 : 50)) * scope.step
      value = Math.min(scope.max, Math.max(scope.min, value))

      if (currentValue !== value) {
        scope.setValue(value)
        scope.dom.dispatchEvent(changeEvent)
      }

      prevPointer.x = event.clientX
      prevPointer.y = event.clientY
    }

    function onMouseUp () {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (Math.abs(distance) < 2) {
        scope.dom.focus()
        scope.dom.select()
      }
    }

    function onTouchStart (event) {
      if (event.touches.length === 1) {
        distance = 0

        onMouseDownValue = scope.value

        prevPointer.x = event.touches[0].pageX
        prevPointer.y = event.touches[0].pageY

        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd)
      }
    }

    function onTouchMove (event) {
      event.preventDefault()

      const currentValue = scope.value

      pointer.x = event.touches[0].pageX
      pointer.y = event.touches[0].pageY

      distance += (pointer.x - prevPointer.x) - (pointer.y - prevPointer.y)

      let value = onMouseDownValue + (distance / (event.shiftKey ? 5 : 50)) * scope.step
      value = Math.min(scope.max, Math.max(scope.min, value))

      if (currentValue !== value) {
        scope.setValue(value)
        scope.dom.dispatchEvent(changeEvent)
      }

      prevPointer.x = event.touches[0].pageX
      prevPointer.y = event.touches[0].pageY
    }

    function onTouchEnd (event) {
      if (event.touches.length === 0) {
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
      }
    }

    function onChange () {
      scope.setValue(scope.dom.value)
    }

    function onFocus () {
      scope.dom.style.backgroundColor = ''
      scope.dom.style.cursor = ''
    }

    function onKeyDown (event) {
      event.stopPropagation()

      switch (event.keyCode) {
        case 13: // enter
          scope.dom.blur()
          break

        case 38: // up
          event.preventDefault()
          scope.setValue(scope.getValue() + scope.nudge)
          scope.dom.dispatchEvent(changeEvent)
          break

        case 40: // down
          event.preventDefault()
          scope.setValue(scope.getValue() - scope.nudge)
          scope.dom.dispatchEvent(changeEvent)
          break
      }
    }

    // onBlur()

    this.dom.addEventListener('keydown', onKeyDown)
    this.dom.addEventListener('mousedown', onMouseDown)
    this.dom.addEventListener('touchstart', onTouchStart, { passive: false })
    this.dom.addEventListener('change', onChange)
    this.dom.addEventListener('focus', onFocus)
    // this.dom.addEventListener('blur', onBlur)
  }

  getValue () {
    return this.value
  }

  setValue (value) {
    if (value !== undefined) {
      value = parseFloat(value)

      if (value < this.min) value = this.min
      if (value > this.max) value = this.max

      this.value = value
      this.dom.value = value.toFixed(this.precision)

      if (this.unit !== '') this.dom.value += ' ' + this.unit
    }

    return this
  }

  setPrecision (precision) {
    this.precision = precision

    return this
  }

  setStep (step) {
    this.step = step

    return this
  }

  setNudge (nudge) {
    this.nudge = nudge

    return this
  }

  setRange (min, max) {
    this.min = min
    this.max = max

    return this
  }

  setUnit (unit) {
    this.unit = unit

    return this
  }
}

export { UIElement, UISpan, UIDiv, UIText, UIInput, UISelect, UICheckbox, UIColor, UINumber }
