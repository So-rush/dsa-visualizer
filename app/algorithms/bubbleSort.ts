export function getBubbleSortSteps(arr: number[]) {
  const steps: any[] = []
  const array = [...arr]
  const n = array.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...array], comparing: [j, j + 1], swapped: false })
      if (array[j] > array[j + 1]) {
        let temp = array[j]; array[j] = array[j + 1]; array[j + 1] = temp
        steps.push({ array: [...array], comparing: [j, j + 1], swapped: true })
      }
    }
  }
  steps.push({ array: [...array], comparing: [], done: true })
  return steps
}