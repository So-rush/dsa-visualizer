export function getQuickSortSteps(arr: number[]) {
  const steps: any[] = []
  const array = [...arr]

  function partition(arr: number[], low: number, high: number) {
    const pivot = arr[high]
    let i = low - 1
    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], swapped: false, pivot: high })
      if (arr[j] < pivot) {
        i++
        let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp
        steps.push({ array: [...arr], comparing: [i, j], swapped: true, pivot: high })
      }
    }
    let temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp
    steps.push({ array: [...arr], comparing: [i + 1, high], swapped: true, pivot: i + 1 })
    return i + 1
  }

  function quickSort(arr: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(arr, low, high)
      quickSort(arr, low, pi - 1)
      quickSort(arr, pi + 1, high)
    }
  }

  quickSort(array, 0, array.length - 1)
  steps.push({ array: [...array], comparing: [], done: true })
  return steps
}