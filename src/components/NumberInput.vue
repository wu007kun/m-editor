<template>
  <div class="number-input-container">
    <input class="number-input"
      ref="numberInput"
      type="number"
      :value="modelValue"
      autocomplete="off"
      :precision="2"
      @input="inputChange"
      @keydown="onKeyDown"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
    >
    <span class="arrow left" @click="changeByStep(-1)"></span>
    <span class="arrow right" @click="changeByStep(1)"></span>
  </div>

</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: Infinity
  },
  min: {
    type: Number,
    default: -Infinity
  },
  step: {
    type: Number,
    default: 0.1
  },
  nudge: {
    type: Number,
    default: 0.1
  },
  precision: {
    type: Number,
    default: 2
  }
})
const emit = defineEmits(['update:modelValue'])
function inputChange (e) {
  setValue(e.target.value)
}
const numberInput = ref()
let distance = 0
let onMouseDownValue = 0

const pointer = { x: 0, y: 0 }
const prevPointer = { x: 0, y: 0 }

function onMouseDown (event) {
  event.preventDefault()
  distance = 0
  onMouseDownValue = props.modelValue
  prevPointer.x = event.clientX
  prevPointer.y = event.clientY
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove (event) {
  pointer.x = event.clientX
  pointer.y = event.clientY
  distance += (pointer.x - prevPointer.x) - (pointer.y - prevPointer.y)
  let value = onMouseDownValue + (distance * (event.shiftKey ? 5 : 0.5)) * props.step
  value = Math.min(props.max, Math.max(props.min, value))
  value = value.toFixed(props.precision) - 0
  setValue(value)
  prevPointer.x = event.clientX
  prevPointer.y = event.clientY
}

function onMouseUp () {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  if (Math.abs(distance) < 2) {
    numberInput.value.focus()
    numberInput.value.select()
  }
}

function onTouchStart (event) {
  if (event.touches.length === 1) {
    distance = 0
    onMouseDownValue = props.modelValue
    prevPointer.x = event.touches[0].pageX
    prevPointer.y = event.touches[0].pageY
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
  }
}

function onTouchMove (event) {
  event.preventDefault()
  pointer.x = event.touches[0].pageX
  pointer.y = event.touches[0].pageY
  distance += (pointer.x - prevPointer.x) - (pointer.y - prevPointer.y)
  let value = onMouseDownValue + (distance / (event.shiftKey ? 5 : 50)) * props.step
  value = Math.min(props.max, Math.max(props.min, value))
  setValue(value)
  prevPointer.x = event.touches[0].pageX
  prevPointer.y = event.touches[0].pageY
}

function onTouchEnd (event) {
  if (event.touches.length === 0) {
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
  }
}
function changeByStep (multi) {
  setValue(props.modelValue + props.nudge * multi)
}

function onKeyDown (event) {
  event.stopPropagation()
  switch (event.keyCode) {
    case 13: // enter
      numberInput.value.blur()
      break
    case 38: // up
      event.preventDefault()
      setValue(props.modelValue + props.nudge)
      break
    case 40: // down
      event.preventDefault()
      setValue(props.modelValue - props.nudge)
      break
  }
}

function setValue (value) {
  emit('update:modelValue', Number(value).toFixed(props.precision) - 0)
}

</script>
<style lang="less">
.number-input-container {
  position: relative;
  .arrow {
    display: none;
    position: absolute; top: 0;
    width: 18px; height: 100%;
    background-color: #656565;
    &:hover {
      background-color: #797979;
    }
    background-size: 50% 50%;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }
  .left {
    left: 0;
    background-image: url('@/assets/images/arrow-left.png');
  }
  .right {
    right: 0;
    background-image: url('@/assets/images/arrow-right.png');
  }
  &:hover {
    .arrow {
      display: block;
    }
  }

}
.number-input {
  background-color: #545454;
  text-align: center;
  color: #D6D6D6;
  cursor: ew-resize;
  outline: none;
  border: none;
  border-radius: 2px;
  height: 24px;
  padding: 0;
  &:focus {
    cursor: text;
    background-color: #222222;
    & ~ .arrow {
      display: none;
    }
  }
  &:active {
    background-color: #292929;
    & ~ .arrow {
      background-color: #222222;
    }
  }
  &:hover:not(:active):not(:focus) {
    background-color: rgb(121, 121, 121);
  }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
