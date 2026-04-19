export function getSelectionSortSteps(arr: number[]) {
  const steps = []
  const array = [...arr]
  const n = array.length

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...array], comparing: [minIdx, j], swapped: false, minIdx })
      if (array[j] < array[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      let temp = array[i]; array[i] = array[minIdx]; array[minIdx] = temp
      steps.push({ array: [...array], comparing: [i, minIdx], swapped: true, minIdx: i })
    }
  }
  steps.push({ array: [...array], comparing: [], done: true })
  return steps
}