function Config () {
  const storage = {
    language: 'zh',
    'project/title': '',
    'project/editable': false,
    'project/vr': false,
    'project/renderer/antialias': true,
    'project/renderer/shadows': true,
    'project/renderer/shadowType': 1, // PCF
    'project/renderer/toneMapping': 0, // NoToneMapping
    'project/renderer/toneMappingExposure': 1,
    'settings/history': false,
    'settings/shortcuts/translate': 'w',
    'settings/shortcuts/rotate': 'e',
    'settings/shortcuts/scale': 'r',
    'settings/shortcuts/undo': 'z',
    'settings/shortcuts/focus': 'f'
  }

  return {

    getKey: function (key) {
      return storage[key]
    },

    setKey: function () { // key, value, key, value ...
      for (let i = 0, l = arguments.length; i < l; i += 2) {
        storage[arguments[i]] = arguments[i + 1]
      }
    }
  }
}

export { Config }
