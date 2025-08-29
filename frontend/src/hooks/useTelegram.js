import { useState, useEffect, useCallback } from 'react'

export const useTelegram = () => {
  const [telegram, setTelegram] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const initTelegram = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Initialize the Telegram Web App
      tg.ready()
      
      // Expand the Web App to full height
      tg.expand()
      
      // Set the main button if needed
      // tg.MainButton.setText('Generate Image')
      // tg.MainButton.show()
      
      setTelegram(tg)
      setIsReady(true)
      
      console.log('Telegram Web App initialized:', {
        initData: tg.initData,
        user: tg.initDataUnsafe?.user,
        themeParams: tg.themeParams,
        colorScheme: tg.colorScheme,
        platform: tg.platform,
        version: tg.version
      })
    } else {
      console.warn('Telegram Web App not available')
      setIsReady(true) // Still ready, just not in Telegram
    }
  }, [])

  const showAlert = useCallback((message) => {
    if (telegram) {
      telegram.showAlert(message)
    } else {
      alert(message)
    }
  }, [telegram])

  const showConfirm = useCallback((message) => {
    if (telegram) {
      return new Promise((resolve) => {
        telegram.showConfirm(message, resolve)
      })
    } else {
      return Promise.resolve(confirm(message))
    }
  }, [telegram])

  const showPopup = useCallback((params) => {
    if (telegram) {
      telegram.showPopup(params)
    } else {
      alert(params.message || 'Popup not available outside Telegram')
    }
  }, [telegram])

  const close = useCallback(() => {
    if (telegram) {
      telegram.close()
    }
  }, [telegram])

  const getUser = useCallback(() => {
    if (telegram?.initDataUnsafe?.user) {
      return telegram.initDataUnsafe.user
    }
    return null
  }, [telegram])

  const getInitData = useCallback(() => {
    return telegram?.initData || ''
  }, [telegram])

  const getThemeParams = useCallback(() => {
    return telegram?.themeParams || {}
  }, [telegram])

  const getColorScheme = useCallback(() => {
    return telegram?.colorScheme || 'light'
  }, [telegram])

  const getPlatform = useCallback(() => {
    return telegram?.platform || 'unknown'
  }, [telegram])

  const isTelegramWebApp = useCallback(() => {
    return !!window.Telegram?.WebApp
  }, [])

  const setHeaderColor = useCallback((color) => {
    if (telegram) {
      telegram.setHeaderColor(color)
    }
  }, [telegram])

  const setBackgroundColor = useCallback((color) => {
    if (telegram) {
      telegram.setBackgroundColor(color)
    }
  }, [telegram])

  const enableClosingConfirmation = useCallback(() => {
    if (telegram) {
      telegram.enableClosingConfirmation()
    }
  }, [telegram])

  const disableClosingConfirmation = useCallback(() => {
    if (telegram) {
      telegram.disableClosingConfirmation()
    }
  }, [telegram])

  const setBackButton = useCallback((callback) => {
    if (telegram) {
      telegram.BackButton.onClick(callback)
    }
  }, [telegram])

  const showBackButton = useCallback(() => {
    if (telegram) {
      telegram.BackButton.show()
    }
  }, [telegram])

  const hideBackButton = useCallback(() => {
    if (telegram) {
      telegram.BackButton.hide()
    }
  }, [telegram])

  const setMainButton = useCallback((text, callback) => {
    if (telegram) {
      telegram.MainButton.setText(text)
      telegram.MainButton.onClick(callback)
    }
  }, [telegram])

  const showMainButton = useCallback(() => {
    if (telegram) {
      telegram.MainButton.show()
    }
  }, [telegram])

  const hideMainButton = useCallback(() => {
    if (telegram) {
      telegram.MainButton.hide()
    }
  }, [telegram])

  const setMainButtonProgress = useCallback((showProgress) => {
    if (telegram) {
      if (showProgress) {
        telegram.MainButton.showProgress()
      } else {
        telegram.MainButton.hideProgress()
      }
    }
  }, [telegram])

  return {
    telegram,
    isReady,
    initTelegram,
    showAlert,
    showConfirm,
    showPopup,
    close,
    getUser,
    getInitData,
    getThemeParams,
    getColorScheme,
    getPlatform,
    isTelegramWebApp,
    setHeaderColor,
    setBackgroundColor,
    enableClosingConfirmation,
    disableClosingConfirmation,
    setBackButton,
    showBackButton,
    hideBackButton,
    setMainButton,
    showMainButton,
    hideMainButton,
    setMainButtonProgress
  }
}
