export function getInsertionSortSteps(arr: number[]) {
  const steps = []
  const array = [...arr]
  const n = array.length

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0 && array[j - 1] > array[j]) {
      steps.push({ array: [...array], comparing: [j - 1, j], swapped: false })
      let temp = array[j]; array[j] = array[j - 1]; array[j - 1] = temp
      steps.push({ array: [...array], comparing: [j - 1, j], swapped: true })
      j--
    }
    steps.push({ array: [...array], comparing: [j], swapped: false })
  }
  steps.push({ array: [...array], comparing: [], done: true })
  return steps
}