export function getMergeSortSteps(arr) {
  const steps = []
  const array = [...arr]

  function merge(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ array: [...arr], comparing: [left + i, mid + 1 + j], swapped: false })
      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++]
      } else {
        arr[k++] = rightArr[j++]
      }
      steps.push({ array: [...arr], comparing: [k - 1], swapped: true })
    }
    while (i < leftArr.length) { arr[k++] = leftArr[i++] }
    while (j < rightArr.length) { arr[k++] = rightArr[j++] }
  }

  function mergeSort(arr, left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2)
      mergeSort(arr, left, mid)
      mergeSort(arr, mid + 1, right)
      merge(arr, left, mid, right)
    }
  }

  mergeSort(array, 0, array.length - 1)
  steps.push({ array: [...array], comparing: [], done: true })
  return steps
}