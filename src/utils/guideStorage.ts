const guideStorageKey = 'galaxy-run:first-flight-guide'

export function hasCompletedGuide() {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(guideStorageKey) === 'complete'
  } catch {
    return false
  }
}

export function rememberGuideCompleted() {
  try {
    window.localStorage.setItem(guideStorageKey, 'complete')
  } catch {
    // The guide still works for this session when browser storage is unavailable.
  }
}
